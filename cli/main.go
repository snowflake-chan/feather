package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"text/tabwriter"
	"time"
)

var version = "0.0.0"
var mode = "runtime"

type cliError struct {
	code string
	msg  string
	exit int
}

func (e *cliError) Error() string { return e.msg }

func usageError(msg string) error         { return &cliError{"USAGE", msg, 2} }
func runtimeError(code, msg string) error { return &cliError{code, msg, 1} }

type parsed struct {
	command     string
	positionals []string
	rest        []string
	values      map[string]string
	flags       map[string]bool
	socket      string
	json        bool
}

var commands = map[string]bool{
	"build": true, "unpack": true, "init": true, "load": true, "up": true, "run": true, "rmi": true,
	"stop": true, "start": true, "restart": true, "ps": true, "maps": true, "inspect": true, "map": true, "logs": true, "eval": true, "rm": true,
}

var valueOptions = map[string]map[string]bool{
	"build":  {"--output": true, "--project-version": true},
	"unpack": {"--dir": true},
	"logs":   {"--tail": true},
	"run":    {"--name": true, "--replicas": true},
	"up":     {"--name": true, "--scale": true, "--replicas": true},
	"init":   {"--id": true, "--name": true, "--version": true},
}
var flagOptions = map[string]map[string]bool{
	"unpack": {"--force": true},
	"load":   {"--replace": true, "--purge-data": true},
	"logs":   {"-f": true, "--follow": true, "--raw": true},
	"rm":     {"--force": true},
	"rmi":    {"--force": true},
	"up":     {"--recreate": true},
	"init":   {"--force": true},
}

func parse(argv []string) (*parsed, error) {
	p := &parsed{values: map[string]string{}, flags: map[string]bool{}}
	separator := false
	for i := 0; i < len(argv); i++ {
		token := argv[i]
		if separator {
			p.rest = append(p.rest, token)
			continue
		}
		if token == "--" {
			separator = true
			continue
		}
		if token == "--json" {
			p.json = true
			continue
		}
		if token == "--socket" {
			if i+1 >= len(argv) {
				return nil, usageError("missing value for --socket")
			}
			i++
			p.socket = argv[i]
			continue
		}
		if token == "--help" || token == "-h" || token == "--version" {
			p.flags[token] = true
			continue
		}
		if p.command == "" {
			if !commands[token] {
				return nil, usageError("unknown command: " + token)
			}
			p.command = token
			continue
		}
		if strings.HasPrefix(token, "-") {
			if token == "-C" || token == "--workspace" {
				return nil, usageError("--workspace / -C was removed; pass the workspace as a positional argument")
			}
			if valueOptions[p.command][token] {
				if i+1 >= len(argv) {
					return nil, usageError("missing value for " + token)
				}
				i++
				p.values[token] = argv[i]
				continue
			}
			if flagOptions[p.command][token] {
				p.flags[token] = true
				continue
			}
			return nil, usageError("unknown option for " + p.command + ": " + token)
		}
		p.positionals = append(p.positionals, token)
	}
	if p.command == "" {
		return nil, usageError("missing command")
	}
	return p, nil
}

func socketPath(explicit string) string {
	if explicit != "" {
		return explicit
	}
	if value := os.Getenv("FEATHER_SOCKET"); value != "" {
		return value
	}
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".feather", "daemon.sock")
}

type client struct {
	http   *http.Client
	socket string
}

func newClient(socket string) *client {
	dialer := &net.Dialer{Timeout: 5 * time.Second}
	tr := &http.Transport{
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			return dialer.DialContext(ctx, "unix", socket)
		},
	}
	return &client{http: &http.Client{Transport: tr}, socket: socket}
}

func (c *client) request(method, path string, body io.Reader, contentType string) ([]byte, error) {
	req, err := http.NewRequest(method, "http://unix"+path, body)
	if err != nil {
		return nil, err
	}
	if contentType != "" {
		req.Header.Set("Content-Type", contentType)
	}
	res, err := c.http.Do(req)
	if err != nil {
		return nil, runtimeError("DAEMON_NOT_RUNNING", fmt.Sprintf("daemon not running: %s", c.socket))
	}
	defer res.Body.Close()
	data, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		var e struct{ Code, Message string }
		if json.Unmarshal(data, &e) == nil && e.Message != "" {
			return nil, runtimeError(e.Code, e.Message)
		}
		return nil, runtimeError("HTTP_ERROR", strings.TrimSpace(string(data)))
	}
	return data, nil
}

func (c *client) json(method, path string, body any) ([]byte, error) {
	var reader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reader = bytes.NewReader(data)
	}
	return c.request(method, path, reader, "application/json")
}

func printJSON(command string, value any) {
	data, _ := json.Marshal(map[string]any{"ok": true, "command": command, "data": value})
	fmt.Println(string(data))
}

func errorHint(code string) string {
	switch code {
	case "DAEMON_NOT_RUNNING":
		return "start it with: featherd --data-root ~/.feather --socket <socket>"
	case "MAP_NOT_FOUND":
		return "run `feather maps`"
	case "INSTANCE_NOT_FOUND":
		return "run `feather ps`"
	case "USAGE":
		return "use --help"
	case "MAP_CONFLICT", "INSTANCE_CONFLICT":
		return "use `feather ps` to inspect existing instances"
	}
	return ""
}

func errorCode(err error) (string, string) {
	var ce *cliError
	if errors.As(err, &ce) {
		return ce.code, ce.msg
	}
	return "INTERNAL", err.Error()
}

func printErrorJSON(command string, err error) {
	code, message := errorCode(err)
	body := map[string]any{"ok": false, "error": map[string]any{"code": code, "message": message}}
	if hint := errorHint(code); hint != "" {
		body["error"].(map[string]any)["hint"] = hint
	}
	if command != "" {
		body["command"] = command
	}
	data, _ := json.Marshal(body)
	fmt.Println(string(data))
}

func printHumanError(err error) {
	code, message := errorCode(err)
	fmt.Fprintf(os.Stderr, "error: %s\n  code: %s\n", message, code)
	if hint := errorHint(code); hint != "" {
		fmt.Fprintf(os.Stderr, "  hint: %s\n", hint)
	}
}

func writeTable(headers []string, rows [][]string) {
	if len(rows) == 0 {
		return
	}
	w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
	fmt.Fprintln(w, strings.Join(headers, "\t"))
	for _, row := range rows {
		fmt.Fprintln(w, strings.Join(row, "\t"))
	}
	w.Flush()
}

var toolExitCode = 0

func runFeatherd(args []string) error {
	bin := os.Getenv("FEATHERD_BIN")
	if bin == "" {
		bin = "featherd"
	}
	cmd := exec.Command(bin, args...)
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr
	err := cmd.Run()
	if err == nil {
		return nil
	}
	var exit *exec.ExitError
	if errors.As(err, &exit) {
		toolExitCode = exit.ExitCode()
		return nil
	}
	return err
}

func run(p *parsed) error {
	socket := socketPath(p.socket)
	c := newClient(socket)
	switch p.command {
	case "ps":
		data, err := c.json("GET", "/v1/instances", nil)
		if err != nil {
			return err
		}
		var maps []map[string]any
		if err := json.Unmarshal(data, &maps); err != nil {
			return err
		}
		if p.json {
			printJSON("ps", maps)
			return nil
		}
		if len(maps) == 0 {
			fmt.Println("no instances")
			return nil
		}
		rows := [][]string{}
		for _, m := range maps {
			port := "-"
			if v, ok := m["port"]; ok && v != nil {
				port = fmt.Sprint(v)
			}
			shard := "-"
			if v, ok := m["shardId"]; ok && v != nil {
				shard = fmt.Sprint(v)
			}
			volume := fmt.Sprint(m["volume"])
			if volume == "<nil>" || volume == "" {
				volume = fmt.Sprint(m["id"])
			}
			rows = append(rows, []string{fmt.Sprint(m["id"]), fmt.Sprint(m["mapId"]), fmt.Sprint(m["state"]), port, shard, volume})
		}
		writeTable([]string{"INSTANCE", "MAP", "STATE", "PORT", "SHARD", "VOLUME"}, rows)
		return nil
	case "maps":
		data, err := c.json("GET", "/v1/maps", nil)
		if err != nil {
			return err
		}
		var maps []map[string]any
		if err := json.Unmarshal(data, &maps); err != nil {
			return err
		}
		if p.json {
			printJSON("maps", maps)
			return nil
		}
		if len(maps) == 0 {
			fmt.Println("no maps")
			return nil
		}
		rows := [][]string{}
		for _, m := range maps {
			rows = append(rows, []string{fmt.Sprint(m["id"]), fmt.Sprint(m["version"]), fmt.Sprint(m["contentHash"]), fmt.Sprint(m["size"]), fmt.Sprint(m["instanceCount"])})
		}
		writeTable([]string{"ID", "VERSION", "HASH", "SIZE", "INSTANCES"}, rows)
		return nil
	case "inspect":
		if len(p.positionals) == 0 {
			return usageError("inspect requires a map id")
		}
		data, err := c.json("GET", "/v1/maps/"+url.PathEscape(p.positionals[0]), nil)
		if err != nil {
			return err
		}
		if p.json {
			printJSON("inspect", json.RawMessage(data))
			return nil
		}
		var m map[string]any
		if err := json.Unmarshal(data, &m); err != nil {
			return err
		}
		defaults, _ := m["defaults"].(map[string]any)
		limits, _ := defaults["limits"].(map[string]any)
		fmt.Printf("ID          %v\n", m["id"])
		fmt.Printf("NAME        %v\n", m["name"])
		fmt.Printf("VERSION     %v\n", m["version"])
		fmt.Printf("CONTENT     %v\n", m["contentHash"])
		fmt.Printf("SIZE        %v\n", m["size"])
		fmt.Printf("INSTALLED   %v\n", m["installedAt"])
		fmt.Printf("DEFAULTS    port=%v volume=%v players=%v memoryMb=%v\n", defaults["port"], defaults["volume"], limits["players"], limits["memoryMb"])
		fmt.Printf("INSTANCES   %v\n", m["instanceCount"])
		if labels, ok := m["labels"].(map[string]any); ok {
			parts := []string{}
			for _, key := range []string{"version", "source"} {
				if value, ok := labels[key]; ok {
					parts = append(parts, fmt.Sprintf("%s=%v", key, value))
				}
			}
			if len(parts) > 0 {
				fmt.Printf("LABELS      %s\n", strings.Join(parts, " "))
			}
		}
		return nil
	case "init":
		args := []string{"workspace", "init"}
		if len(p.positionals) > 0 {
			args = append(args, p.positionals[0])
		}
		for _, key := range []string{"--id", "--name", "--version"} {
			if value := p.values[key]; value != "" {
				args = append(args, key, value)
			}
		}
		if p.flags["--force"] {
			args = append(args, "--force")
		}
		if p.json {
			args = append(args, "--json")
		}
		return runFeatherd(args)
	case "build":
		rootArg := "."
		if len(p.positionals) > 0 {
			rootArg = p.positionals[0]
		}
		root, err := filepath.Abs(rootArg)

		if err != nil {
			return err
		}
		args := []string{"build", root}
		if value := p.values["--output"]; value != "" {
			args = append(args, "--output", value)
		}
		if value := p.values["--project-version"]; value != "" {
			args = append(args, "--project-version", value)
		}
		if p.json {
			args = append(args, "--json")
		}
		return runFeatherd(args)
	case "unpack":
		archiveArg := ""
		if len(p.positionals) > 0 {
			archiveArg = p.positionals[0]
		} else {
			found, err := findArchiveInCwd(".boxproject", ".fmap")
			if err != nil {
				return err
			}
			archiveArg = found
		}
		archive, err := filepath.Abs(archiveArg)
		if err != nil {
			return err
		}
		args := []string{"unpack", archive}
		if value := p.values["--dir"]; value != "" {
			args = append(args, "--dir", value)
		}
		if p.flags["--force"] {
			args = append(args, "--force")
		}
		if p.json {
			args = append(args, "--json")
		}
		return runFeatherd(args)
	case "load":
		archive := ""
		if len(p.positionals) > 0 {
			archive = p.positionals[0]
		} else {
			found, err := findArchiveInCwd(".fmap", ".boxplay")
			if err != nil {
				return err
			}
			archive = found
		}
		f, err := os.Open(archive)
		if err != nil {
			return err
		}
		defer f.Close()
		path := "/v1/maps/import"
		sep := "?"
		if p.flags["--replace"] {
			path += sep + "replace=1"
			sep = "&"
		}
		if p.flags["--purge-data"] {
			path += sep + "purge=1"
		}
		data, err := c.request("POST", path, f, "application/gzip")
		if err != nil {
			return err
		}
		if p.json {
			printJSON(p.command, json.RawMessage(data))
			return nil
		}
		var imported struct {
			Maps []struct {
				ID string `json:"id"`
			} `json:"maps"`
		}
		if err := json.Unmarshal(data, &imported); err != nil {
			return err
		}
		for _, m := range imported.Maps {
			fmt.Printf("loaded  %s\n", m.ID)
		}
		return nil
	case "logs":
		if len(p.positionals) == 0 {
			return usageError("logs requires a map id")
		}
		query := url.Values{}
		if p.flags["-f"] || p.flags["--follow"] {
			query.Set("follow", "1")
		}
		if tail := p.values["--tail"]; tail != "" {
			query.Set("tail", tail)
		}
		path := "/v1/instances/" + url.PathEscape(p.positionals[0]) + "/logs"
		if len(query) > 0 {
			path += "?" + query.Encode()
		}
		req, _ := http.NewRequest("GET", "http://unix"+path, nil)
		res, err := c.http.Do(req)
		if err != nil {
			return runtimeError("DAEMON_NOT_RUNNING", "daemon not running: "+socket)
		}
		defer res.Body.Close()
		if res.StatusCode < 200 || res.StatusCode >= 300 {
			body, _ := io.ReadAll(res.Body)
			return runtimeError("HTTP_ERROR", string(body))
		}
		scanner := bufio.NewScanner(res.Body)
		scanner.Buffer(make([]byte, 64*1024), 4*1024*1024)
		for scanner.Scan() {
			line := scanner.Text()
			if p.json {
				fmt.Println(line)
				continue
			}
			var entry struct{ Time, Stream, Message string }
			if json.Unmarshal([]byte(line), &entry) == nil && entry.Message != "" {
				if p.flags["--raw"] {
					fmt.Println(entry.Message)
				} else {
					fmt.Printf("%s [%s] %s\n", entry.Time, entry.Stream, entry.Message)
				}
			} else {
				fmt.Println(line)
			}
		}
		return scanner.Err()
	case "eval":
		if len(p.positionals) == 0 {
			return usageError("eval requires a map id")
		}
		code := strings.Join(p.rest, " ")
		if code == "" {
			code = strings.Join(p.positionals[1:], " ")
		}
		data, err := c.json("POST", "/v1/instances/"+url.PathEscape(p.positionals[0])+"/eval", map[string]string{"code": code})
		if err != nil {
			return err
		}
		if p.json {
			printJSON(p.command, json.RawMessage(data))
			return nil
		}
		var result map[string]any
		_ = json.Unmarshal(data, &result)
		fmt.Println(result["result"])
		return nil
	case "up":
		return runDeploy(c, p)
	case "run":
		return runUp(c, p)
	case "start", "stop", "restart", "rm":
		return runMapAction(c, p)
	case "rmi":
		if len(p.positionals) == 0 {
			return usageError("rmi requires a map id")
		}
		query := ""
		if p.flags["--force"] {
			query = "?force=1"
		}
		data, err := c.json("DELETE", "/v1/maps/"+url.PathEscape(p.positionals[0])+query, nil)
		if err != nil {
			return err
		}
		if p.json {
			printJSON("rmi", json.RawMessage(data))
			return nil
		}
		fmt.Println("removed\t" + p.positionals[0])
		return nil
	}
	return usageError("unknown command: " + p.command)
}

func buildWorkspaceForUp(workspace string) (string, func(), error) {
	tmp, err := os.CreateTemp("", "feather-up-*.fmap")
	if err != nil {
		return "", nil, err
	}
	tmpPath := tmp.Name()
	tmp.Close()
	os.Remove(tmpPath)
	toolExitCode = 0
	if err := runFeatherd([]string{"build", workspace, "--output", tmpPath}); err != nil {
		os.Remove(tmpPath)
		return "", nil, err
	}
	if toolExitCode != 0 {
		os.Remove(tmpPath)
		return "", nil, runtimeError("BUILD_FAILED", "featherd build failed")
	}
	return tmpPath, func() { os.Remove(tmpPath) }, nil
}

func resolveUpInput(input string) (archive string, mapID string, cleanup func(), err error) {
	if input == "" {
		input = "."
	}
	info, statErr := os.Stat(input)
	if statErr == nil && info.IsDir() {
		if _, err := os.Stat(filepath.Join(input, "feather.toml")); err == nil {
			archive, cleanup, err = buildWorkspaceForUp(input)
			return archive, "", cleanup, err
		}
		return "", "", nil, usageError("up directory is not a workspace (missing feather.toml): " + input)
	}
	if statErr == nil && !info.IsDir() {
		return input, "", func() {}, nil
	}
	if input == "." {
		wd, _ := os.Getwd()
		return "", filepath.Base(wd), func() {}, nil
	}
	return "", input, func() {}, nil
}

func importUpArchive(c *client, archive string) (string, error) {
	f, err := os.Open(archive)
	if err != nil {
		return "", err
	}
	defer f.Close()
	q := url.Values{}
	q.Set("replace", "1")
	q.Set("recreate", "1")
	data, err := c.request("POST", "/v1/maps/import?"+q.Encode(), f, "application/gzip")
	if err != nil {
		return "", err
	}
	var imported struct {
		Maps []struct {
			ID string `json:"id"`
		} `json:"maps"`
	}
	if err := json.Unmarshal(data, &imported); err != nil {
		return "", err
	}
	if len(imported.Maps) == 0 {
		return "", runtimeError("ARCHIVE_INVALID", "archive has no maps")
	}
	return imported.Maps[0].ID, nil
}

func runDeploy(c *client, p *parsed) error {
	input := ""
	if len(p.positionals) > 0 {
		input = p.positionals[0]
	}
	archive, mapID, cleanup, err := resolveUpInput(input)
	if err != nil {
		return err
	}
	defer cleanup()
	if archive != "" {
		mapID, err = importUpArchive(c, archive)
		if err != nil {
			return err
		}
	}
	if mapID == "" {
		return usageError("up could not determine a map")
	}
	scale := 1
	if value := p.values["--scale"]; value != "" {
		n, err := strconv.Atoi(value)
		if err != nil || n < 1 {
			return usageError("--scale must be >= 1")
		}
		scale = n
	} else if value := p.values["--replicas"]; value != "" {
		n, err := strconv.Atoi(value)
		if err != nil || n < 1 {
			return usageError("--replicas must be >= 1")
		}
		scale = n
	}
	baseName := p.values["--name"]
	data, err := c.json("GET", "/v1/maps/"+url.PathEscape(mapID), nil)
	if err != nil {
		return err
	}
	var def map[string]any
	if err := json.Unmarshal(data, &def); err != nil {
		return err
	}
	hash := fmt.Sprint(def["contentHash"])
	names := []string{}
	if scale == 1 {
		name := baseName
		if name == "" {
			name = mapID
		}
		names = append(names, name)
	} else {
		base := baseName
		if base == "" {
			base = mapID
		}
		for i := 1; i <= scale; i++ {
			names = append(names, fmt.Sprintf("%s-%d", base, i))
		}
	}
	for _, name := range names {
		existing, err := c.json("GET", "/v1/instances/"+url.PathEscape(name), nil)
		if err == nil {
			var inst map[string]any
			_ = json.Unmarshal(existing, &inst)
			needsRecreate := p.flags["--recreate"] || fmt.Sprint(inst["mapContentHash"]) != hash
			if needsRecreate {
				_, _ = c.json("POST", "/v1/instances/"+url.PathEscape(name)+"/stop", nil)
				if _, err := c.json("DELETE", "/v1/instances/"+url.PathEscape(name), nil); err != nil {
					return err
				}
			} else {
				if _, err := c.json("POST", "/v1/instances/"+url.PathEscape(name)+"/start", nil); err != nil {
					return err
				}
				continue
			}
		} else {
			var ce *cliError
			if !errors.As(err, &ce) || ce.code != "MAP_NOT_FOUND" {
				return err
			}
		}
		if _, err := c.json("POST", "/v1/instances", map[string]any{"mapId": mapID, "id": name}); err != nil {
			return err
		}
		if _, err := c.json("POST", "/v1/instances/"+url.PathEscape(name)+"/start", nil); err != nil {
			return err
		}
	}
	targets, err := fetchInstances(c, names)
	if err != nil {
		return err
	}
	if p.json {
		printJSON("up", targets)
		return nil
	}
	for _, m := range targets {
		fmt.Printf("up  %v  map=%v  state=%v  url=%v\n", m["id"], m["mapId"], m["state"], m["url"])
	}
	return nil
}

func runUp(c *client, p *parsed) error {
	maps := append([]string{}, p.positionals...)
	if len(maps) == 0 {
		return usageError("run requires a map id")
	}
	replicas := 1
	if value := p.values["--replicas"]; value != "" {
		n, err := strconv.Atoi(value)
		if err != nil || n < 1 {
			return usageError("--replicas must be >= 1")
		}
		replicas = n
	}
	baseName := p.values["--name"]
	allNames := []string{}
	for _, mapID := range maps {
		names := []string{}
		if replicas == 1 {
			names = []string{baseName}
			if names[0] == "" {
				names[0] = mapID
			}
		} else {
			base := baseName
			if base == "" {
				base = mapID
			}
			for i := 1; i <= replicas; i++ {
				names = append(names, fmt.Sprintf("%s-%d", base, i))
			}
		}
		for _, name := range names {
			allNames = append(allNames, name)
			if _, err := c.json("POST", "/v1/instances", map[string]any{"mapId": mapID, "id": name}); err != nil {
				return err
			}
			if _, err := c.json("POST", "/v1/instances/"+url.PathEscape(name)+"/start", nil); err != nil {
				return err
			}
		}
	}
	created, err := fetchInstances(c, allNames)
	if err != nil {
		return err
	}
	if p.json {
		printJSON("run", created)
		return nil
	}
	for _, m := range created {
		fmt.Printf("created  %v  map=%v  state=%v\n", m["id"], m["mapId"], m["state"])
	}
	return nil
}

func fetchInstances(c *client, names []string) ([]map[string]any, error) {
	result := []map[string]any{}
	for _, name := range names {
		data, err := c.json("GET", "/v1/instances/"+url.PathEscape(name), nil)
		if err != nil {
			return nil, err
		}
		var m map[string]any
		if err := json.Unmarshal(data, &m); err != nil {
			return nil, err
		}
		result = append(result, m)
	}
	return result, nil
}

func runMapAction(c *client, p *parsed) error {
	if len(p.positionals) == 0 {
		return usageError(p.command + " requires a map id")
	}
	for _, id := range p.positionals {
		var path string
		switch p.command {
		case "start":
			path = "/v1/instances/" + url.PathEscape(id) + "/start"
		case "stop":
			path = "/v1/instances/" + url.PathEscape(id) + "/stop"
		case "restart":
			path = "/v1/instances/" + url.PathEscape(id) + "/restart"
		case "rm":
			query := ""
			if p.flags["--force"] {
				query = "?force=1"
			}
			data, err := c.json("DELETE", "/v1/instances/"+url.PathEscape(id)+query, nil)
			if err != nil {
				return err
			}
			if p.json {
				printJSON(p.command, json.RawMessage(data))
			} else {
				fmt.Printf("removed  %s\n", id)
			}
			continue
		}
		if _, err := c.json("POST", path, nil); err != nil {
			return err
		}
		instData, err := c.json("GET", "/v1/instances/"+url.PathEscape(id), nil)
		if err != nil {
			return err
		}
		if p.json {
			printJSON(p.command, json.RawMessage(instData))
		} else {
			var inst map[string]any
			_ = json.Unmarshal(instData, &inst)
			fmt.Printf("%s  %v  map=%v\n", p.command, inst["id"], inst["mapId"])
		}
	}
	return nil
}

func modeAuthoringCommand(command string) bool {
	return command == "init" || command == "build" || command == "unpack"
}

func findArchiveInCwd(exts ...string) (string, error) {
	dirs := []string{".", "dist"}
	seen := map[string]bool{}
	var found []string
	for _, dir := range dirs {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}
			if !slices.Contains(exts, strings.ToLower(filepath.Ext(entry.Name()))) {
				continue
			}
			full := filepath.Join(dir, entry.Name())
			if seen[full] {
				continue
			}
			seen[full] = true
			found = append(found, full)
		}
	}
	if len(found) == 0 {
		return "", usageError("no archive in current directory; pass an archive path")
	}
	if len(found) > 1 {
		return "", usageError("multiple archives in current directory: " + strings.Join(found, ", "))
	}
	return found[0], nil
}

func main() {
	if len(os.Args) == 2 && (os.Args[1] == "--help" || os.Args[1] == "-h") {
		if mode == "authoring" {
			fmt.Println("featherc <init|build|unpack> [options]")
		} else {
			fmt.Println("feather [--socket <path>] [--json] <load|maps|inspect|up|run|start|stop|restart|ps|logs|eval|rm|rmi>")
		}
		return
	}
	if len(os.Args) == 2 && os.Args[1] == "--version" {
		fmt.Println("feather " + version)
		return
	}
	p, err := parse(os.Args[1:])
	if err != nil {
		if slices.Contains(os.Args[1:], "--json") {
			printErrorJSON("", err)
		} else {
			printHumanError(err)
		}
		var ce *cliError
		if errors.As(err, &ce) {
			os.Exit(ce.exit)
		}
		os.Exit(1)
	}
	if p.flags["--help"] || p.flags["-h"] {
		if mode == "authoring" {
			fmt.Println("featherc <init|build|unpack> [options]")
		} else {
			fmt.Println("feather [--socket <path>] [--json] <load|maps|inspect|up|run|start|stop|restart|ps|logs|eval|rm|rmi>")
		}
		return
	}
	if p.flags["--version"] {
		fmt.Println("feather " + version)
		return
	}
	allowed := map[string]bool{
		"load": true, "maps": true, "inspect": true, "up": true, "run": true,
		"start": true, "stop": true, "restart": true, "ps": true, "logs": true,
		"eval": true, "rm": true, "rmi": true,
	}
	if mode == "authoring" {
		allowed = map[string]bool{"init": true, "build": true, "unpack": true}
	}
	if !allowed[p.command] {
		hint := "feather"
		use := "featherc"
		if mode == "authoring" {
			hint = "featherc"
			use = "feather"
		}
		err := usageError(fmt.Sprintf("%s does not support %s; use %s", hint, p.command, use))
		if p.json {
			printErrorJSON(p.command, err)
		} else {
			printHumanError(err)
		}
		os.Exit(2)
	}
	if err := run(p); err != nil {
		if p.json {
			printErrorJSON(p.command, err)
		} else {
			printHumanError(err)
		}
		var ce *cliError
		if errors.As(err, &ce) {
			os.Exit(ce.exit)
		}
		os.Exit(1)
	}
	if toolExitCode != 0 {
		os.Exit(toolExitCode)
	}
}

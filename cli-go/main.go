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
	"strings"
	"time"
)

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
	"daemon": true, "build": true, "unpack": true, "load": true, "up": true,
	"stop": true, "restart": true, "ps": true, "logs": true, "eval": true, "rm": true,
}

var valueOptions = map[string]map[string]bool{
	"daemon": {"--data-root": true, "--host": true, "--port": true, "--token": true},
	"build":  {"--output": true, "--project-version": true},
	"unpack": {"--dir": true},
	"logs":   {"--tail": true},
}
var flagOptions = map[string]map[string]bool{
	"daemon": {"--enable-eval": true, "--tcp": true},
	"unpack": {"--force": true},
	"load":   {"--replace": true, "--purge-data": true},
	"logs":   {"-f": true, "--follow": true},
	"rm":     {"--force": true},
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
	if p.values["--data-root"] != "" && p.command != "daemon" {
		return nil, usageError("--data-root is a daemon option; client commands use --socket")
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
		return nil, runtimeError("DAEMON_NOT_RUNNING", fmt.Sprintf("daemon not running: %s\nhint: start it with: feather daemon", c.socket))
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
	case "daemon":
		bin := os.Getenv("FEATHERD_BIN")
		if bin == "" {
			bin = "featherd"
		}
		args := []string{}
		if p.values["--data-root"] != "" {
			args = append(args, "--data-root", p.values["--data-root"])
		}
		if p.socket != "" {
			args = append(args, "--socket", p.socket)
		}
		if p.flags["--enable-eval"] {
			args = append(args, "--enable-eval")
		}
		for _, key := range []string{"--host", "--port", "--token"} {
			if value := p.values[key]; value != "" {
				args = append(args, key, value)
			}
		}
		if p.flags["--tcp"] {
			args = append(args, "--tcp")
		}
		cmd := exec.Command(bin, args...)
		cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr
		return cmd.Run()
	case "ps":
		data, err := c.json("GET", "/v1/maps", nil)
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
			fmt.Println("no maps")
			return nil
		}
		fmt.Println("ID\tSTATE\tPORT\tSHARD\tVOLUME")
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
			fmt.Printf("%v\t%v\t%s\t%s\t%s\n", m["id"], m["state"], port, shard, volume)
		}
		return nil
	case "up":
		if len(p.positionals) == 0 {
			data, err := c.json("GET", "/v1/maps", nil)
			if err != nil {
				return err
			}
			var maps []map[string]any
			if err := json.Unmarshal(data, &maps); err != nil {
				return err
			}
			for _, m := range maps {
				p.positionals = append(p.positionals, fmt.Sprint(m["id"]))
			}
		}
		for _, id := range p.positionals {
			if _, err := c.json("POST", "/v1/maps/"+url.PathEscape(id)+"/start", nil); err != nil {
				return err
			}
		}
		data, err := c.json("GET", "/v1/maps", nil)
		if err != nil {
			return err
		}
		var maps []map[string]any
		if err := json.Unmarshal(data, &maps); err != nil {
			return err
		}
		if p.json {
			printJSON("up", maps)
			return nil
		}
		selected := map[string]bool{}
		for _, id := range p.positionals {
			selected[id] = true
		}
		for _, m := range maps {
			if !selected[fmt.Sprint(m["id"])] {
				continue
			}
			shard := "-"
			if v, ok := m["shardId"]; ok && v != nil {
				shard = fmt.Sprint(v)
			}
			fmt.Printf("%v\t%v\t%v\tshard=%s\n", m["id"], m["state"], m["url"], shard)
		}
		return nil
	case "stop", "restart", "rm":
		return runMapAction(c, p)
	case "build":
		if len(p.positionals) == 0 {
			return usageError("build requires a workspace or .boxproject")
		}
		root, err := filepath.Abs(p.positionals[0])
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
		if len(p.positionals) == 0 {
			return usageError("unpack requires a project archive")
		}
		archive, err := filepath.Abs(p.positionals[0])
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
		if len(p.positionals) == 0 {
			return usageError("load requires an archive")
		}
		archive := p.positionals[0]
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
		fmt.Println(string(data))
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
		path := "/v1/maps/" + url.PathEscape(p.positionals[0]) + "/logs"
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
			var entry struct{ Time, Stream, Message string }
			if json.Unmarshal([]byte(line), &entry) == nil && entry.Message != "" {
				fmt.Printf("%s [%s] %s\n", entry.Time, entry.Stream, entry.Message)
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
		data, err := c.json("POST", "/v1/maps/"+p.positionals[0]+"/eval", map[string]string{"code": code})
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
	}
	return usageError("unknown command: " + p.command)
}

func runMapAction(c *client, p *parsed) error {
	if len(p.positionals) == 0 {
		return usageError(p.command + " requires a map id")
	}
	for _, id := range p.positionals {
		var path string
		switch p.command {
		case "up":
			path = "/v1/maps/" + id + "/start"
		case "stop":
			path = "/v1/maps/" + id + "/stop"
		case "restart":
			path = "/v1/maps/" + id + "/restart"
		case "rm":
			query := ""
			if p.flags["--force"] {
				query = "?force=1"
			}
			data, err := c.json("DELETE", "/v1/maps/"+id+query, nil)
			if err != nil {
				return err
			}
			if p.json {
				printJSON(p.command, json.RawMessage(data))
			} else {
				fmt.Printf("%s\tremoved\n", id)
			}
			continue
		}
		data, err := c.json("POST", path, nil)
		if err != nil {
			return err
		}
		if p.json {
			printJSON(p.command, json.RawMessage(data))
		} else {
			var op map[string]any
			_ = json.Unmarshal(data, &op)
			fmt.Printf("%v\t%v\n", op["mapId"], op["state"])
		}
	}
	return nil
}

func main() {
	if len(os.Args) == 2 && (os.Args[1] == "--help" || os.Args[1] == "-h") {
		fmt.Println("feather-go [--socket <path>] [--json] <daemon|build|unpack|load|up|stop|restart|ps|logs|eval|rm>")
		return
	}
	if len(os.Args) == 2 && os.Args[1] == "--version" {
		fmt.Println("feather-go 0.0.0")
		return
	}
	p, err := parse(os.Args[1:])
	if err != nil {
		var ce *cliError
		if errors.As(err, &ce) {
			fmt.Fprintln(os.Stderr, ce.code+": "+ce.msg)
			os.Exit(ce.exit)
		}
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	if p.flags["--help"] || p.flags["-h"] {
		fmt.Println("feather-go [--socket <path>] [--json] <daemon|build|unpack|load|up|stop|restart|ps|logs|eval|rm>")
		return
	}
	if p.flags["--version"] {
		fmt.Println("feather 0.0.0")
		return
	}
	if err := run(p); err != nil {
		var ce *cliError
		if errors.As(err, &ce) {
			fmt.Fprintln(os.Stderr, ce.code+": "+ce.msg)
			os.Exit(ce.exit)
		}
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	if toolExitCode != 0 {
		os.Exit(toolExitCode)
	}
}

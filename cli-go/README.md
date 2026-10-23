# feather

Runtime/ops CLI `feather`; authoring CLI `featherc`. It speaks JSON over `featherd`'s Unix socket and does
not parse workspaces, build archives, or run the builder.

```bash
cd cli-go
go build -o feather .
go build -ldflags "-X main.mode=authoring" -o featherc .
./feather --socket ~/.feather/daemon.sock ps
./featherc build /path/to/workspace
./feather load /path/to/map.fmap
```

`featherd` starts the Node daemon (`FEATHERD_BIN`, default
`featherd`). The daemon/engine remain Node; this binary replaces only the
CLI.

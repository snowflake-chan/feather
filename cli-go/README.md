# feather-go

Thin control-plane CLI. It speaks JSON over `featherd`'s Unix socket and does
not parse workspaces, build archives, or run the builder.

```bash
cd cli-go
go build -o feather .
./feather --socket ~/.feather/daemon.sock ps
./feather build /path/to/workspace
./feather load /path/to/map.fmap
```

`feather daemon` starts the Node daemon (`FEATHERD_BIN`, default
`featherd`). The daemon/engine remain Node; this binary replaces only the
CLI.

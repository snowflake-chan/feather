# 数据存储

`storage` API 的驱动选择。和脚本 SQL（`sql` API / `SQLJS`）是两层，不要混。

## 默认

`METHOD=local` 且没配 `BOX_DATABASE_URL` 时，默认走 **SQLite**：

```
STORAGE_PATH=/var/lib/feather
→ /var/lib/feather/data.sqlite
```

## 配置

```bash
# 显式 SQLite（默认 local 已经是这个）
BOX_DATA_STORAGE_DRIVER=sqlite
BOX_DATA_STORAGE_PATH=/var/lib/feather
# 或
BOX_DATABASE_URL=sqlite:///var/lib/feather/data.sqlite
# 或内存（测试）
BOX_DATABASE_URL=sqlite::memory:
```

```bash
# PostgreSQL（多机 / 重写入）
BOX_DATABASE_URL=postgres://user:pass@host:5432/feather
```

选择顺序：

1. `BOX_DATABASE_URL=sqlite:` → SQLite
2. `BOX_DATA_STORAGE_DRIVER=sqlite` → SQLite
3. `BOX_DATABASE_URL=postgres://` → PostgreSQL
4. `METHOD=local` → SQLite
5. 否则 → `DisabledDataStorage`（返回 500）

## SQLite 注意

- 使用 Node 内置 `node:sqlite`（Node 22+，实验特性，会有 ExperimentalWarning）
- WAL 模式：单写多读；`busy_timeout=5000`
- 适合**单机、单进程或同机多进程**
- 不要放 NFS/SMB
- 多进程高频写 group storage 可能 `SQLITE_BUSY`；重负载再上 PG

## 表结构

- `records`：当前值（JSON）
- `history`：按 version 的历史
- `tables`：表元数据
- namespace：project / group；mode：play / edit

## 测试

```bash
cd engine
node -r @swc-node/register scripts/check-sqlite-data-storage.ts
```

端到端（engine + worker + 脚本 `storage` API）：

```bash
SCRIPT=scripts/storage-validation.js \
BOX_DATA_STORAGE_DRIVER=sqlite \
STORAGE_PATH=/tmp/feather-sqlite-e2e \
... node dist/src/launch.js
```

预期：

```
SQLite data storage ready: {"driver":"sqlite","path":".../data.sqlite",...}
[shell:error] Error: [storage-validation] value=... inc=2
```

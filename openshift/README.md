# OpenShift install (Binary Build, no GitHub pull)

This cluster enforces **restricted SCC**. A "demo Db2" container that runs privileged/root will **not** start.
Use **Db2u Operator** or an **external Db2** service.

## 1) Create project
```bash
oc new-project bcm-assessment
```

## 2) Create Db2 connection secret (recommended)
Create a secret named `db2-conn` (optional but required for Db2 connectivity):

```bash
oc create secret generic db2-conn   --from-literal=DB2_HOST="<db2-host-or-service>"   --from-literal=DB2_PORT="50000"   --from-literal=DB2_DB="BCMDB"   --from-literal=DB2_USER="<user>"   --from-literal=DB2_PASSWORD="<password>"
```

> If you do not create this secret, the app will still start (DB wait is skipped), and you can configure Db2 in the UI Settings page.

## 3) Apply app manifests
```bash
oc apply -f openshift/app.yaml
```

## 4) Build from local folder (binary build)
From repo root:
```bash
oc start-build bcm-assessment --from-dir=. --follow
```

## 5) Rollout
```bash
oc rollout status deploy/bcm-assessment
oc get route bcm-assessment
```

## Optional (NOT default): Demo Db2
A demo Db2 manifest is included only for permissive clusters:
- `openshift/db2-demo-optional.yaml`

It requires privileged/root and will fail under restricted SCC.

## Notes
- The deployment includes an initContainer `wait-for-db2` which waits for `${DB2_HOST}:${DB2_PORT}` only when `DB2_HOST` is set (via secret or env).

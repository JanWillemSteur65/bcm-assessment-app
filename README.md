# BCM Assessment App (OpenShift Binary Build, restricted SCC compatible)

This repository is a standalone BCM assessment web app:
- React (Vite) + IBM Carbon UI
- Node/Express API
- IBM Db2 storage (schema + seed) **when a Db2 service is provided**
- OpenShift Binary Build (deploy from local folder; no Git pull)

## Important (restricted SCC)
Many OpenShift clusters enforce `restricted`/`restricted-v2` SCC. A privileged “demo Db2” pod will not be allowed.
Use **Db2u Operator** or an **external Db2** service and provide connection details via a Secret or via the UI wizard.

## First-time login
If Db2 is not connected yet, you can still log in using the fallback admin:
- **admin@example.com / admin123**

Then open **Settings → Db2 connection wizard** to configure Db2.

Once Db2 is reachable and initialized, logins become DB-backed.

## OpenShift install (no GitHub pull)

```bash
oc new-project bcm-assessment

# (Optional but recommended) Provide Db2 connection via Secret:
oc create secret generic db2-conn   --from-literal=DB2_HOST="<db2-host-or-service>"   --from-literal=DB2_PORT="50000"   --from-literal=DB2_DB="BCMDB"   --from-literal=DB2_USER="<user>"   --from-literal=DB2_PASSWORD="<password>"

oc apply -f openshift/app.yaml

# build from local folder (repo root):
oc start-build bcm-assessment --from-dir=. --follow

oc rollout status deploy/bcm-assessment
oc get route bcm-assessment
```

## Notes
- The deployment includes an initContainer `wait-for-db2` which waits only when `DB2_HOST` is set.
- Db2 configuration can also be set from the UI Settings page and is stored in the uploads PVC as `db-conn.json`.

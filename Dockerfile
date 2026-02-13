FROM registry.access.redhat.com/ubi9/nodejs-20:latest

WORKDIR /opt/app-root/src

USER 0
RUN mkdir -p /opt/app-root/src  && chown -R 1001:0 /opt/app-root/src  && chmod -R g+rwX /opt/app-root/src

RUN dnf -y install gcc gcc-c++ make python3 tar gzip  && dnf clean all

ENV npm_config_build_from_source=true     NODE_ENV=production     PORT=8080

COPY --chown=1001:0 package*.json .npmrc* ./
USER 1001
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi  && npm rebuild ibm_db --build-from-source

USER 0
COPY --chown=1001:0 ui ./ui
RUN chmod -R g+rwX /opt/app-root/src/ui
USER 1001
RUN npm --prefix ui ci || npm --prefix ui install
RUN npm --prefix ui run build

USER 0
RUN rm -rf /opt/app-root/src/public  && cp -r /opt/app-root/src/ui/dist /opt/app-root/src/public  && chmod -R g+rwX /opt/app-root/src/public

COPY --chown=1001:0 src ./src
RUN chmod -R g+rwX /opt/app-root/src/src

USER 1001
EXPOSE 8080
CMD ["npm","start"]

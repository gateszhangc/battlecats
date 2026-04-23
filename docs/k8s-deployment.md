# battlecats.lol 部署说明

## 部署映射

- GitHub repository: `gateszhangc/battlecats`
- Git branch: `main`
- Dokploy project: `none`
- Image repository: `registry.144.91.77.245.sslip.io/battlecats`
- K8s manifest path: `deploy/k8s/overlays/prod`
- Argo CD application: `battlecats`
- Primary domain: `battlecats.lol`
- Preview domain: `battlecats.144.91.77.245.sslip.io`

发布链路：

`gateszhangc/battlecats -> main -> registry.144.91.77.245.sslip.io/battlecats -> deploy/k8s/overlays/prod -> ArgoCD battlecats`

## 运行方式

1. `main` 分支推送触发 `.github/workflows/build-and-release.yml`
2. GitHub Actions 构建镜像并推送到私有 registry
3. 同一工作流回写 `deploy/k8s/overlays/prod/kustomization.yaml` 的 `newTag`
4. ArgoCD 自动同步 `deploy/k8s/overlays/prod`
5. Ingress 暴露 `battlecats.lol`、`www.battlecats.lol` 和预览域名

## 必需 Secrets

### GitHub Actions Secrets

- `REGISTRY_USERNAME`
- `REGISTRY_PASSWORD`

### 集群内 Secrets

- `battlecats-registry`
  用于拉取 `registry.144.91.77.245.sslip.io/battlecats`
- `cloudflare-api-token-secret`
  用于 `cert-manager` 通过 Cloudflare DNS-01 签发证书

这两个 Secrets 以 `SealedSecret` 形式保存在 `deploy/k8s/overlays/prod/`。

## DNS / TLS

- 域名托管：Cloudflare
- apex 记录：`battlecats.lol -> 144.91.77.245`
- `www`：`CNAME -> battlecats.lol`
- 证书：命名空间 `battlecats` 下的 `Issuer/letsencrypt-prod-cloudflare`
- `www` 使用 308 永久重定向到 apex

## GSC

- 只接入 Google Search Console
- 属性类型：`Domain property`
- 目标属性：`battlecats.lol`
- sitemap：`https://battlecats.lol/sitemap.xml`

## 验收

- 本地 Playwright 通过
- Docker 本地构建通过
- GitHub Actions 成功推镜像并回写 `newTag`
- ArgoCD `battlecats` 应用状态 `Healthy + Synced`
- `https://battlecats.lol/` 可访问
- `https://www.battlecats.lol/` 308 到 `https://battlecats.lol/`
- GSC 显示属性已验证且 sitemap 已提交

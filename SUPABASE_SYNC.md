# FitOS 电脑与手机同步

FitOS 仍部署在 GitHub Pages。GitHub Pages 只托管静态网页；跨设备记录存储在用户自己创建的 Supabase 项目中。每个账号只有一份完整云端快照，FitOS 保留“上传覆盖云端”和“下载替换本机”两个明确操作，不会静默合并互相冲突的数据。

## 一次性建立 Supabase 后端

1. 在 Supabase 创建一个项目，记下 Project URL 和公开的 `anon` / `publishable` key。
2. 打开项目的 SQL Editor，执行下面脚本：

```sql
create table if not exists public.fitos_sync (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.fitos_sync enable row level security;
grant select, insert, update on public.fitos_sync to authenticated;

create policy "Users can read own FitOS backup"
  on public.fitos_sync for select to authenticated
  using (auth.uid() = user_id);
create policy "Users can insert own FitOS backup"
  on public.fitos_sync for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Users can update own FitOS backup"
  on public.fitos_sync for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

3. 在 FitOS 的“设置 → 电脑与手机同步”里填 Project URL、anon/publishable key 并保存。不要填 `service_role` key。
4. 用邮箱和密码注册同步账户。若 Supabase 要求邮箱验证，先点邮件验证，再回 FitOS 登录。

## 两台设备同步

每台设备都打开公开 FitOS 网站，并填写相同的 Supabase Project URL 和 anon key，使用同一个同步账户登录。

- 从当前有最新记录的设备点“上传本机数据到云端”。这会覆盖该账户上一份云端快照。
- 在另一台设备点“下载云端数据并替换本机”。下载会完整替换该浏览器的 FitOS 数据；建议先导出本机 JSON 备份。
- 在另一方向同步时，先从另一台设备上传，再在第一台下载。

不要在不同设备同时离线编辑后连续上传：FitOS 不做字段级冲突合并，后一次上传会覆盖先前的云端快照。退出账户只清除当前标签页会话，不会删除云端快照。删除账号或云数据需在 Supabase 控制台操作。

## 隐私与安全

- FitOS 业务数据从浏览器通过 HTTPS 直接传给你配置的 Supabase 项目；启用 RLS 后，每个认证用户只能读写自己的行。
- anon/publishable key 是客户端公开标识，安全边界由认证和 RLS 策略提供。绝不能在网页填入或仓库提交 `service_role` key。
- 登录会话只保存在当前浏览器标签页的 sessionStorage；关闭标签页后需要重新登录。
- 这不是 GitHub 账号登录，也不使用 GitHub 仓库存个人训练或饮食数据。
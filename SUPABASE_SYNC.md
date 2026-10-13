# FitOS 电脑与手机自动同步

GitHub Pages 只托管 FitOS 网页；跨设备业务数据保存在你自己创建的 Supabase 项目中。FitOS 默认保留本机 IndexedDB，并在登录后开启自动同步。

## 一次性配置

1. 在 Supabase 创建项目，保存 Project URL 和公开的 `anon` / `publishable` key。
2. 在项目 SQL Editor 执行下方建表及 RLS 策略脚本。
3. 在 FitOS 的“设置 → 电脑与手机同步”填写 Project URL 和公开 key。
4. 注册并验证邮箱，然后登录。

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

## 自动同步行为

- 登录成功后，FitOS 自动下载云端快照并替换本机数据。
- 若账号还没有云端快照，首次登录会把当前设备已有数据上传，作为初始云端快照。
- 打开或刷新 FitOS 时，如果浏览器仍保留登录状态，会自动检查并获取云端最新数据。
- 每次本地数据更改后，FitOS 会稍作等待再自动上传。网络中断时数据仍保留在本机，恢复联网并再次编辑后会重试。
- 如果本机存在时间晚于云端快照的未同步修改，FitOS 优先上传本机版本；否则下载云端版本。
- 这是整份数据快照同步，不是实时协作或字段级合并。不同设备同时编辑同一份数据仍可能产生覆盖，重要数据建议定期导出 JSON。

每台设备都需要填写同一项目 URL 和公开 key，并使用同一同步账号登录。浏览器本地的登录状态会保留，直到用户退出、浏览器数据被清理，或 Supabase 会话失效。共用设备请退出登录。

## 隐私与安全

- 业务数据通过 HTTPS 从浏览器发送至你配置的 Supabase 项目；RLS 让认证用户只能访问自己的云端记录。
- `anon` / `publishable` key 是客户端公开标识。绝不要在网页或代码仓库中使用 `service_role` / Secret key。
- 登录会话令牌会持久保存在当前浏览器的本地存储中，以支持关闭和重新打开后保持登录。设备其他使用者若能使用同一浏览器，也可能访问该账户；请在共享设备退出登录。
- FitOS 的 AI API Key 不会包含在同步数据快照中。
- Supabase 同步不是 GitHub 登录，也不会把个人训练或饮食数据提交到 GitHub 仓库。

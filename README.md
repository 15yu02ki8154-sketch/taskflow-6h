# taskflow-6h

6時間で作った最小構成のタスク/プロジェクト管理アプリ（Next.js + Supabase）。
ログイン → プロジェクトの追加/削除 → ログアウトまで一通り動作します。

## Demo
- App: https://taskflow-6h.vercel.app
- Login: https://taskflow-6h.vercel.app/login

## Features
- Emailログイン（Supabase Auth）
- /projects でプロジェクト一覧表示
- プロジェクト追加 / 削除（RLSで自分のデータのみ操作可能）
- ログアウト

## Tech Stack
- Next.js（App Router）
- TypeScript
- Supabase（Auth / Postgres / RLS）
- Vercel

## Architecture / 設計意図
- App Routerを使用し、ページ単位で責務を分離
- SupabaseのRLSを活用し、フロント側ではなくDB側でデータ保護を担保
- 認証callbackはSuspense境界でラップし、ビルドエラーを回避
- user_idを必ず持たせる設計にすることでマルチユーザー対応を前提とした構造

## ERD（簡易）
auth.users (Supabase)
   1 ─── n
projects (user_id)

## DB Schema（概要）
projects
- id: uuid (PK)
- user_id: uuid（auth.users参照）
- name: text
- created_at: timestamptz

RLS:
- SELECT/INSERT/DELETE: auth.uid() = user_id

## Auth Flow（ざっくり）
- /login でログイン
- Supabaseが /auth/callback に戻す
- callbackでセッション確立 → /projects へリダイレクト

## How to Run (Local)
1. `.env.local` を作成
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

2. 起動
```bash
npm install
npm run dev




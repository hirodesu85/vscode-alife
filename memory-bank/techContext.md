# VSCode Alife - 技術コンテキスト

## 開発環境

### 1. 必要条件

- Node.js v20.x 以上
- VSCode v1.92.0 以上
- TypeScript v5.4.5 以上

### 2. 主要な依存関係

```json
{
  "devDependencies": {
    "@types/vscode": "^1.92.0",
    "@typescript-eslint/eslint-plugin": "^7.14.1",
    "@typescript-eslint/parser": "^7.11.0",
    "typescript": "^5.4.5",
    "webpack": "^5.92.1",
    "webpack-cli": "^5.1.4"
  }
}
```

## 技術スタック

### 1. コア技術

- **TypeScript**: 型安全な開発環境の提供
- **VSCode Extension API**: 拡張機能の基盤
- **HTML5 Canvas**: グラフィックスレンダリング
- **WebView API**: VSCode 統合インターフェース

### 2. ビルドツール

- **webpack**: モジュールバンドル
- **ts-loader**: TypeScript コンパイル
- **ESLint**: コード品質管理

## VSCode 拡張機能の構成

### 1. エントリーポイント

```typescript
// extension.ts
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "boid.webview",
      new WebViewProvider(context.extensionUri)
    )
  );
}
```

### 2. マニフェスト設定

```json
{
  "contributes": {
    "views": {
      "explorer": [
        {
          "type": "webview",
          "id": "boid.webview",
          "name": "Boid Simulation"
        }
      ]
    }
  }
}
```

## パフォーマンス要件

### 1. レンダリング性能

- フレームレート: 60fps 目標
- スムーズなアニメーション
- 効率的なキャンバス更新

### 2. メモリ使用

- 最大 Boid 数: 10
- 効率的なデータ構造
- メモリリーク防止

### 3. CPU 使用

- バックグラウンド処理の最適化
- 効率的な計算アルゴリズム
- イベントスロットリング

## セキュリティ考慮事項

### 1. WebView セキュリティ

- enableScripts: true
- 限定的なリソースアクセス
- 安全なコンテンツ配信

### 2. エラー処理

- 境界値チェック
- 適切な例外処理
- ユーザー入力のバリデーション

## 開発ワークフロー

### 1. ビルドプロセス

```bash
# 開発ビルド
npm run compile
npm run watch

# プロダクションビルド
npm run package
```

### 2. テスト

```bash
# テストの実行
npm run test

# テストのコンパイル
npm run compile-tests
```

### 3. リント

```bash
# ESLintによるコード検証
npm run lint
```

## デバッグとトラブルシューティング

### 1. デバッグ設定

- VSCode デバッガーの使用
- 開発者ツールの活用
- ログ出力の設定

### 2. 一般的な問題

- WebView の読み込み問題
- パフォーマンスボトルネック
- メモリリーク

### 3. モニタリング

- パフォーマンスプロファイリング
- メモリ使用量の追跡
- エラーログの分析

# ブロックバランス — グリッド連鎖版

[ゲームをプレイ](https://hsgwyuki0429-design.github.io/block-balance/)

1×1の白い土台から、様々な形を積んで同色消去の連鎖を狙うゲームです。

- 横位置は1マス単位。3択の候補を選び、Rで90度回転、Spaceで落下。
- マウス・タッチでも位置を指定。左右キー／左右ボタンでも移動可能。
- 1マスでも下に支えがあれば形全体が止まる。傾き・横滑り・物理エンジンは使用しない。
- 同色の別ブロックが上下左右で接触すると形全体が消去。白い土台は対象外。
- 支えを失うと再落下し、次の消去が起これば連鎖。
- 消去マス数×100点×連鎖倍率（1、2、4、8…、最大1,048,576）。
- ブロック全体が土台より5マス下へ落ちたらゲームオーバー。
- 落下中・連鎖解決中は次の投入を待つ。着地予測表示はなし。

## 開発

Node.js 24推奨。

```sh
npm ci
npm run dev
npm test
npm run test:e2e
npm run build
```

`src/grid.js` がゲームルール、`src/shapes.js` が形と色、`src/main.js` が操作と描画。編集用HTMLは `index.source.html`。ビルドは `dist/` を生成し、ブランチ式Pages向けにルートの `index.html` と `assets/` にもコピーします。ソース変更後はビルドして公開ファイルもコミットしてください。

ブラウザテストはMicrosoft Edgeを使用。Edgeのない環境では `playwright.config.js` のchannel指定を外し `npx playwright install chromium` を実行します。

仕様と仮設定は [docs/DESIGN.md](docs/DESIGN.md) に記録しています。

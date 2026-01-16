/**
 * 日本語言語パック
 */
export default {
  // 共通
  common: {
    yes: "はい",
    no: "いいえ",
    skip: "スキップ",
    cancel: "キャンセル",
    confirm: "確認",
    error: "エラー",
    success: "成功",
  },

  // パッケージ選択
  package: {
    selectPackage: "公開するパッケージを選択してください",
    selectedPackage: "選択されたパッケージ",
  },

  // Changelog
  changelog: {
    input: "changelogを入力してください（1行入力、複数回入力対応、Enterキーで終了）",
    singleLineHint: "複数回の1行入力をサポート、Enterキーで終了。入力が空の場合、デフォルトのバージョンアップグレード記録が使用されます",
    empty: "changelogは空にできません",
    generate: "CHANGELOG.mdファイルを生成しますか？",
    usingDefault: "デフォルトのchangelogを使用：バージョンアップグレード記録",
    defaultContent: "バージョンアップグレード: {currentVersion} → {newVersion}",
  },

  // バージョン
  version: {
    selectType: "バージョンタイプを選択",
    currentVersion: "現在のバージョン",
    finalVersion: "最終バージョン",
    customVersion: "カスタムバージョン",
    customVersionDesc: "バージョンを手動で入力",
    inputVersion: "バージョン番号を入力してください",
    example: "例",
    versionEmpty: "バージョンは空にできません",
    patch: "パッチバージョン - バグ修正",
    minor: "マイナーバージョン - 新機能、後方互換",
    major: "メジャーバージョン - 破壊的変更",
    invalid: "無効なバージョン番号",
    invalidWithVersion: "無効なバージョン番号: {version}",
    cannotGenerate: "次のバージョンを生成できません",
    unsupportedType: "サポートされていないリリースタイプ",
    unsupportedTypeWithType: "サポートされていないリリースタイプ: {type}",
    versionFormat: "{current} -> {next}",
  },

  // スクリプト
  script: {
    select: "実行するスクリプトを選択してください（通常はbuild）",
    noScripts: "このパッケージにはスクリプトがありません",
    running: "スクリプトを実行中",
    success: "スクリプトの実行に成功しました",
    failed: "スクリプトの実行に失敗しました",
    notFound: "スクリプトが見つかりません",
    notFoundWithName: "スクリプト \"{name}\" が見つかりません",
    executionFailed: "スクリプトの実行に失敗しました、終了コード: {exitCode}",
  },

  // Git
  git: {
    pushTag: "git tagをプッシュしますか？",
    createTagFailed: "git tagの作成に失敗しました、終了コード: {exitCode}",
    pushTagFailed: "git tagのプッシュに失敗しました、終了コード: {exitCode}，エラー: {error}",
    pushTagTimeout: "git tagのプッシュがタイムアウトしました（{timeout}秒）",
    commitFailed: "git commitの作成に失敗しました、終了コード: {exitCode}，エラー: {error}",
    pushCodeFailed: "コードのプッシュに失敗しました、終了コード: {exitCode}，エラー: {error}",
    pushCodeTimeout: "コードのプッシュがタイムアウトしました（{timeout}秒）",
  },

  // Registry
  registry: {
    input: "npm registryアドレスを入力してください",
    empty: "registryアドレスは空にできません",
    invalid: "有効なURLを入力してください",
  },

  // 公開
  publish: {
    preview: "公開設定プレビュー",
    packageName: "パッケージ名",
    currentVersion: "現在のバージョン",
    newVersion: "新しいバージョン",
    tag: "Tag",
    changelog: "Changelog",
    registry: "Registry",
    pushTag: "Tagをプッシュ",
    generateChangelog: "Changelogを生成",
    script: "スクリプト",
    confirm: "公開を確認しますか？",
    publishing: "npmに公開中...",
    success: "公開に成功しました！",
    failed: "公開に失敗しました",
    cancelled: "公開がキャンセルされました",
    error: "公開中にエラーが発生しました",
    generalError: "エラー",
    npmPublishFailed: "npm公開に失敗しました、終了コード: {exitCode}",
    npmNotLoggedIn: "npm registry にログインしていません: {registry}，先に 'npm login --registry {registry}' を実行してください",
    npmAuthCheckFailed: "npm ログイン状態の確認に失敗しました (registry: {registry}): {error}",
    needOtp: "npm公開のワンタイムコード（OTP）を入力する必要がありますか？",
    inputOtp: "ワンタイムコード（OTP）を入力してください",
    otpEmpty: "ワンタイムコードは空にできません",
    otpInvalid: "ワンタイムコードは6桁の数字である必要があります",
    otp: "ワンタイムコード（OTP）",
    rollingBack: "公開に失敗しました、変更をロールバック中...",
    rollbackComplete: "ロールバックが完了しました",
    rollbackFailed: "ロールバックに失敗しました、バージョンとchangelogを手動で復元してください:",
    updatingVersion: "バージョン番号を更新中...",
    versionUpdated: "バージョン番号の更新に成功しました",
    versionUpdateFailed: "バージョン番号の更新に失敗しました",
    updatingChangelog: "changelogを更新中...",
    changelogUpdated: "changelogの更新に成功しました",
    changelogUpdateFailed: "changelogの更新に失敗しました",
    checkingNpmAuth: "npmログイン状態を確認中...",
    npmAuthChecked: "npmログイン状態の確認に成功しました",
    creatingCommit: "git commitを作成中...",
    commitCreated: "git commitの作成に成功しました",
    commitFailed: "git commitの作成に失敗しました",
    pushingCode: "リモートリポジトリにコードをプッシュ中...",
    codePushed: "コードのプッシュに成功しました",
    codePushFailed: "コードのプッシュに失敗しました",
    creatingTag: "git tagを作成中...",
    tagCreated: "git tagの作成に成功しました",
    tagCreateFailed: "git tagの作成に失敗しました",
    pushingTag: "git tagをプッシュ中...",
    tagPushed: "git tagのプッシュに成功しました",
    tagPushFailed: "git tagのプッシュに失敗しました",
  },

  // 成功メッセージ
  success: {
    title: "公開に成功しました！",
    packageName: "パッケージ名",
    version: "バージョン",
    registry: "Registry",
    thanks: "bun-pushをご利用いただきありがとうございます！",
  },

  // Changelogタイプ
  changelogTypes: {
    added: "追加",
    changed: "変更",
    deprecated: "非推奨",
    removed: "削除",
    fixed: "修正",
    security: "セキュリティ",
  },

  // Workspace
  workspace: {
    packageJsonNotFound: "package.jsonファイルが見つかりません",
    workspacesConfigInvalid: "workspaces設定が無効です",
    packageNotFound: "パッケージが見つかりません",
    packageNotFoundByPath: "パス {path} にパッケージが見つかりません",
    monorepoRequiresPath: "monorepoモードでは、packagePathを指定するかCLIモードを使用する必要があります",
  },
};

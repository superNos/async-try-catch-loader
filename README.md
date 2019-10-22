# async-try-catch-loader

自动对距离await最近的async增加try/catch异常捕获，如果已存在try/catch处理则跳过

## 用法

```
yarn add babylon @babel/traverse @babel/types recast babel-core -D
```

`注意需要放在babel-loader前`
const dayjs = require('dayjs') // 載入 dayjs 套件
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)// 把 relativeTime 這個 plugin 加載進來
module.exports = {
  relativeTimeFromNow: a => dayjs(a).fromNow(), // 當我們呼叫 relativeTimeFromNow 並傳入一個時間參數 a，這個函式會回傳 dayjs(a).fromNow()，把絕對時間轉換成相對描述。
  currentYear: () => dayjs().year(), // 取得當年年份作為 currentYear 的屬性值，並導出
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  }
  // 傳入的參數 a 和 b 對應到文件上的 conditions。return 的部分，我們用了三元運算子來簡化 if/else 流程，若 a 和 b 相等，會回傳 options.fn(this)，不相等則回傳 options.inverse(this)，和官方文件中的流程是一樣的。
}

const getOffset = (limit = 10, page = 1) => (page - 1) * limit

const getPagination = (limit = 10, page = 1, total = 50) => {
  const totalPage = Math.ceil(total / limit)
  const pages = Array.from({ length: totalPage }, (_, index) => index + 1)
  const currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page
  const prev = currentPage - 1 < 1 ? 1 : currentPage - 1
  const next = currentPage + 1 > totalPage ? totalPage : currentPage + 1

  return {
    pages,
    totalPage,
    currentPage,
    prev,
    next
  }
}

module.exports = {
  getOffset,
  getPagination
}
// getOffset
// 送出查詢到資料庫前，需要知道偏移量（offset）。假設網站是規劃每頁 10 筆資料的話（limit = 10），那讀取 page 2 的資料時，就需要偏移 10，從第 11 筆資料開始抓取，計算的公式是 offset = (page - 1) * limit 。

// getPagination
// 這個函式負責準備剛剛畫面中需要的 5 個參數，讓我們一一來看一下它們的計算公式，大家可以試著帶入實際的數字想想看，可能會比較好理解：

// totalPage - 是一個數值，代表總共有幾頁。計算公式為 Math.ceil(total / limit)，例如全部有 50 筆資料，一頁顯示 10 筆，就是 5 頁。如果有 51 筆資料，則需要無條件進位為 6 頁。
// pages - 是一個陣列，假如總共有 5 頁，這個陣列就會是[1, 2, 3, 4, 5] ，對應到導覽器上「1、2、3、4、5」的按鈕。
// 給大家看一下在 Repl 上的實驗結果：

// https://assets-lighthouse.alphacamp.co/uploads/image/file/19344/ExportedContentImage_06.png

// currentPage - 是一個數值，代表當前是第幾頁。這一行計算公式裡面有兩層三元運算，要從後面一組開始讀。
// 先讀 page > totalPage ? totalPage : page
// 再讀page < 1 ? 1 : 前一組運算結果
// prev - 是一個數值，代表前一頁是第幾頁。這裡的判斷式在負責抓最前面的邊界，假設當前頁是 1，那點擊前一頁就還是第一頁。假設當前頁是 2，那前一頁就是 2 - 1= 1 第一頁。
// next - 是一個數值，代表下一頁是第幾頁。判斷式負責抓出最後面的邊界，假設當前頁面是 5，但總共只有五頁，那點擊下一頁時依然會停留在第五頁。
// 在 currentPage 的計算方式中，講師為大家示範比較精簡的寫法，用 if...else 改寫也是可以的，不同寫法給大家參考：

// let currentPage
// if (page < 1) {
//   currentPage = 1
// } else if (page > totalPage) {
//   currentPage = totalPage
// } else {
//   currentPage = page
// }
// 現在 helper 裡的工具都準備好了，就可以比較輕鬆地前往 Controller 完成最後的邏輯。

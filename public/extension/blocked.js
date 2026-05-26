const QUOTES = [
  { text: "Sự tập trung không phải là thứ bạn có, mà là thứ bạn luyện tập mỗi ngày.", author: "— Thành Lê" },
  { text: "Thành công là tổng của những nỗ lực nhỏ được lặp lại ngày này qua ngày khác.", author: "— Robert Collier" },
  { text: "Đừng xem đồng hồ, hãy làm những gì nó làm — cứ tiếp tục.", author: "— Sam Levenson" },
  { text: "Bạn không cần phải tuyệt vời để bắt đầu, nhưng bạn phải bắt đầu để trở nên tuyệt vời.", author: "— Zig Ziglar" },
  { text: "Mỗi chuyên gia đều từng là người mới bắt đầu. Hãy tiếp tục học.", author: "— Helen Hayes" },
  { text: "Kỷ luật là cầu nối giữa mục tiêu và thành tựu.", author: "— Jim Rohn" },
  { text: "Không có phím tắt nào đến bất kỳ nơi nào đáng đến.", author: "— Beverly Sills" },
  { text: "Học hôm nay, dẫn đầu ngày mai.", author: "— Thành Lê" },
  { text: "Mỗi phút bạn dành để học là đầu tư cho tương lai của chính mình.", author: "— Thành Lê" },
  { text: "Khó khăn chỉ là cơ hội trong bộ quần áo làm việc.", author: "— Henry Kaiser" },
  { text: "Đừng để những gì bạn không thể làm cản trở những gì bạn có thể làm.", author: "— John Wooden" },
  { text: "Tương lai thuộc về những người tin vào vẻ đẹp của ước mơ.", author: "— Eleanor Roosevelt" },
  { text: "Thành công không phải là chìa khóa để hạnh phúc. Hạnh phúc là chìa khóa để thành công.", author: "— Albert Schweitzer" },
  { text: "Hãy bắt đầu từ nơi bạn đang đứng, dùng những gì bạn có, làm những gì bạn có thể.", author: "— Arthur Ashe" },
  { text: "Một giờ học hôm nay bằng nhiều giờ hối tiếc ngày mai.", author: "— Thành Lê" },
];

const params = new URLSearchParams(location.search);
const site = params.get('site') || '';
if (site) document.getElementById('site-name').textContent = site;

const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
document.getElementById('quote-text').textContent = '“' + q.text + '”';
document.getElementById('quote-author').textContent = q.author;

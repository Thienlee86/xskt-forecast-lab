# Phương pháp V1

## Bài toán

V1 xếp hạng 100 giá trị hai chữ số cuối giải đặc biệt cho từng tỉnh XSMN. Điểm hiển thị là điểm xếp hạng chuẩn hóa, không được diễn giải như xác suất trúng đã hiệu chỉnh.

## Thành phần mô hình

Ensemble V1 kết hợp:

- 30% tần suất có Laplace smoothing.
- 30% tần suất có trọng số giảm dần theo thời gian.
- 15% chuyển tiếp bậc một từ kết quả gần nhất.
- 25% mô hình độc lập chữ số hàng chục và hàng đơn vị.

Các trọng số này là cấu hình khởi đầu, chưa phải kết quả tối ưu. Chỉ thay đổi sau nested walk-forward validation.

## Backtest

Với kỳ kiểm tra tại chỉ số `i`, tập huấn luyện bắt buộc là `[0, i)`. Kết quả tại `i` không được tham gia tạo đặc trưng hoặc chọn tham số.

Báo cáo ba mô hình:

1. Ensemble.
2. Baseline tần suất.
3. Baseline ngẫu nhiên có seed xác định để tái lập.

## Chỉ số

- Hit@1/5/10: kết quả thật nằm trong K vị trí đầu.
- MRR: nghịch đảo thứ hạng trung bình.
- Brier score đa lớp: độ sai lệch của toàn bộ phân phối; thấp hơn tốt hơn.

Cần bổ sung khoảng tin cậy bootstrap và kiểm định chênh lệch ghép cặp khi đã có đủ dữ liệu.

## Quy tắc nâng mô hình

Một challenger chỉ được đề nghị thay champion khi:

- Vượt baseline trên dữ liệu ngoài mẫu.
- Cải thiện không chỉ tập trung ở một tỉnh hoặc một giai đoạn ngắn.
- Không suy giảm mạnh Brier score.
- Số kỳ kiểm tra đạt ngưỡng định trước.
- Cấu hình, dữ liệu đầu vào và kết quả có thể tái lập.

## Lộ trình tiếp theo

- Snapshot dữ liệu độc lập trong repo mới.
- Schema validation và data-quality report.
- Nested walk-forward để chọn cửa sổ/trọng số.
- Bootstrap confidence intervals theo tỉnh.
- Calibration curve và reliability diagram.
- Champion–challenger registry và drift monitor.

//File index.js là file front-end trong server
//Dùng emit/on connection-disconnect và callUser và answerCall

//Biến app yêu cầu express
const app = require("express")();
//Tạo server yêu cầu http (mô-đun được tích hợp sẵn) và truyền vào app đã được tích hợp express
const server = require("http").createServer(app);
//Khởi tạo cors (một gói phần mềm trung để thực hiện một số yêu cầu gốc)
const cors = require("cors");

//Khởi tạo io (socket.io) và truyền vào 2 tham số server và cors
const io = require("socket.io")(server, {
	cors: {
		//Cho phép truy cập từ tất cả các nguồn
		origin: "*",
		//Khai báo các phương thức sử dụng GET POST
		methods: [ "GET", "POST" ]
	}
});

//Cho app sử dụng cors như một chức năng
app.use(cors());

//Khai báo PORT của mình (process.env.PORT) hoặc localhost 5000
const PORT = process.env.PORT || 5000;

//Gửi thông báo 'Running' khi có ai đó truy cập máy chủ
app.get('/', (req, res) => {
	res.send('Running');
});

//Socket lắng nghe "connection" có thiết bị kết nối
io.on("connection", (socket) => {
	//socket phát ra cho thiết bị tham gia "me" một thông báo về id riêng
	socket.emit("me", socket.id);

	//Socket lắng nghe "disconnect" khi biết bị ngắt kết nối
	socket.on("disconnect", () => {
		//Phát ra thông báo cuộc gọi kết thúc
		socket.broadcast.emit("callEnded")
	});

	//Socket lắng nghe "callUser" và truyền dữ liệu:
	//+ Id người dùng muốn gọi (userToCall)
	//+ Tín hiệu dữ liệu (signalData)
	//+ Cuộc gọi từ đâu đến (from)
	//+ Tên người gọi (name)
	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		//Socket gửi "callUser" đến id người được gọi (userToCall) và gửi các dữ liệu { signal: signalData, from, name }
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});


	//Socket lắng nghe "answerCall" (Phản hồi cuộc gọi)
	socket.on("answerCall", (data) => {
		//Phát ra thông báo chấp nhận và gửi lại tín hiệu dữ liệu
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

//Server thông báo đang chạy và đang trên PORT nào
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
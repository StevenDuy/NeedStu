export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-950 text-white">
      <h1 className="text-4xl font-bold mb-4 tracking-tight">NeedStu <span className="text-blue-500">Hub</span></h1>
      <p className="text-lg text-gray-400 mb-8 text-center max-w-md">
        Nền tảng tiện ích All-in-one siêu mượt dành riêng cho sinh viên.
      </p>
      
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-800 pb-2">Trạng thái hệ thống:</h2>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-gray-300">Giao diện (Frontend): <span className="text-green-400 font-medium">Đang chạy</span></p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-gray-300">Máy chủ (Backend): <span className="text-blue-400 font-medium">Sẵn sàng</span></p>
          </div>
        </div>
      </div>
    </main>
  );
}

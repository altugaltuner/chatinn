export default function CreateGroup({ setShowCreateGroupModal }: { setShowCreateGroupModal: (show: boolean) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowCreateGroupModal(false);
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full max-w-md relative">
        <button onClick={() => setShowCreateGroupModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">X</button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Grup Oluştur</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grup Adı</label>
            <input type="text" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-indigo-500 dark:focus:ring-indigo-500" />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grup Açıklaması</label>
            <textarea className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-indigo-500 dark:focus:ring-indigo-500" />
          </div>

          <button type="submit" className="w-full rounded-md bg-indigo-500 text-white px-4 py-2 hover:bg-indigo-600">Grup Oluştur</button>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grup Türü</label>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="groupType"
                  value="private"
                  className="form-radio text-indigo-600"
                  defaultChecked
                />
                <span className="ml-2 text-gray-700 dark:text-gray-200">Özel</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="groupType"
                  value="public"
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-200">Genel</span>
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export default function CreateGroup({ setShowCreateGroupModal }: { setShowCreateGroupModal: (show: boolean) => void }) {
  const { user } = useAuth();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // groupType'ı boolean is_public'e çevir
    const isPublic = groupType === "public";
    
    fetch("http://localhost:3001/api/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        name: groupName, 
        description: groupDescription, 
        is_public: isPublic, 
        created_by: user?.id 
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("✅ " + data.message);
          setShowCreateGroupModal(false);
          window.location.reload(); // Sayfayı yenile
        } else {
          alert("❌ Grup oluşturulamadı");
          console.error("Failed to create group:", data.error);
        }
      })
      .catch((err) => {
        console.error("Grup oluşturma hatası:", err);
        alert("❌ Bağlantı hatası!");
      });
  };

const [groupType, setGroupType] = useState("private");
const [groupName, setGroupName] = useState("");
const [groupDescription, setGroupDescription] = useState("");

const handleGroupTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setGroupType(e.target.value);
};

const handleGroupNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setGroupName(e.target.value);
};

const handleGroupDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setGroupDescription(e.target.value);
};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#00000096] bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 w-full max-w-md relative">
        <button onClick={() => setShowCreateGroupModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer">X</button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Grup Oluştur</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grup Adı</label>
            <input 
              type="text" 
              value={groupName} 
              onChange={handleGroupNameChange} 
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2" 
              placeholder="Örn: Yazılım Geliştiriciler"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Grup Açıklaması</label>
            <textarea 
              value={groupDescription} 
              onChange={handleGroupDescriptionChange} 
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 min-h-[80px]" 
              placeholder="Grup hakkında kısa bir açıklama..."
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grup Türü</label>
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="groupType"
                  value="private"
                  checked={groupType === "private"}
                  onChange={handleGroupTypeChange}
                  className="form-radio text-indigo-600 w-4 h-4"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-200">🔒 Özel</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="groupType"
                  value="public"
                  checked={groupType === "public"}
                  onChange={handleGroupTypeChange}
                  className="form-radio text-indigo-600 w-4 h-4"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-200">🌍 Genel</span>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!groupName || !groupDescription || !groupType} 
            className="w-full rounded-md bg-indigo-500 text-white px-4 py-2 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
          >
            Grup Oluştur
          </button>
        </form>
      </div>
    </div>
  );
}
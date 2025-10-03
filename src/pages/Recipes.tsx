import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

type Detail = {
  id: number;
  name: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: string;
  cuisine: string;
  caloriesPerServing: number;
  rating: number;
  tags: string[];
  mealType: string[];
};

const BASE = "https://dummyjson.com";

export default function Recipes() {
  const { id } = useParams<{ id: string }>();
  // Maintaining original state parameter names: data, loading, err
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    
    // Implemented async/await logic for cleaner fetch handling
    const fetchRecipeDetail = async () => {
      try {
        setLoading(true);
        setErr(""); // Clear previous errors

        const rid = Number(id);
        const res = await fetch(`${BASE}/recipes/${rid}`, { headers: { Accept: "application/json" } });
        
        if (!res.ok) {
            // Throw a descriptive error if the HTTP status is bad
            throw new Error(`Failed to fetch recipe details (HTTP ${res.status})`);
        }
        const json: Detail = await res.json();
        
        // Using original state updater 'setData'
        setData(json);
      } catch (error: unknown) {
        console.error("Error fetching recipe:", error);
        // Using original state updater 'setErr'
        if (error instanceof Error) {
          setErr(error.message);
        } else {
          setErr("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipeDetail();
  }, [id]);

  if (loading) return <p className="status">Loading…</p>;
  if (err) return <p className="status error">Error: {err}</p>;
  if (!data) return <p className="status">Not found.</p>;

  const total = data.prepTimeMinutes + data.cookTimeMinutes;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-xl shadow-lg my-8">
      <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block">← 목록으로 돌아가기 (Back to List)</Link>

      <div className="md:flex md:space-x-6 space-y-4 md:space-y-0 pb-6 border-b">
        <div className="md:w-1/2 shot">
          <img 
            src={data.image} 
            alt={data.name} 
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>

        <div className="md:w-1/2 sheet-info space-y-4">
          <div className="head space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
            <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-700">
                {data.difficulty}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-gray-600 text-sm">
            <div><b className="font-semibold text-gray-800">총 시간:</b> {total}분</div>
            <div><b className="font-semibold text-gray-800">준비:</b> {data.prepTimeMinutes}분</div>
            <div><b className="font-semibold text-gray-800">조리:</b> {data.cookTimeMinutes}분</div>
             <div>
                <b className="font-semibold text-gray-800">평점:</b> 
                <span className="text-yellow-500 ml-1">{data.rating} / 5</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {data.tags.slice(0, 4).map((t, i) => (
              <span key={i} className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
                    #{t}
                </span>
            ))}
          </div>
        </div>
      </div>

      <div className="block mt-6 space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">재료 (Ingredients)</h2>
          <p className="text-gray-700 leading-relaxed list">{data.ingredients.join(" • ")}</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">레시피 (Instructions)</h2>
          <ol className="list-decimal pl-5 space-y-3 text-gray-700">
            {data.instructions.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>

        <div className="pt-4 border-t">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">요리 정보 (Details)</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div><b className="font-medium text-gray-800">유형:</b> {data.cuisine}</div>
            <div><b className="font-medium text-gray-800">칼로리/1인분:</b> {data.caloriesPerServing} kcal</div>
            <div><b className="font-medium text-gray-800">특징:</b> {data.mealType.join(", ")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
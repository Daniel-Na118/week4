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

        const res = await fetch(`https://dummyjson.com/recipes/${id}`);
        
        if (!res.ok) {
            // Throw a descriptive error if the HTTP status is bad
            throw new Error(`Failed to fetch recipe details`);
        }
        const json = await res.json();
        
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
    <div className="recipe-detail-container">
      <Link to="/" className="back-button">← 모든 레시피 보기</Link>
      <div className="recipe-detail-main-content">
        <div className="recipe-detail-image-wrapper">
          <img src={data.image} alt={data.name} className="recipe-detail-image" />
        </div>

        <div className="recipe-detail-header-info">
          <div className="header-text">
            <h1>{data.name}</h1>
            <span className="recipe-difficulty-detail">{data.difficulty}</span>
          </div>
          <div className="recipe-time-info">
            <p><strong>총 요리시간</strong> {total}분</p>
            <p><strong>준비시간</strong> {data.prepTimeMinutes}분</p>
            <p><strong>조리시간</strong> {data.cookTimeMinutes}분</p>
          </div>
          <div className="recipe-detail-tags">
            {data.tags.map((tag, index) => (
              <span key={index} className="recipe-tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="recipe-detail-ingredients-section">
        <h2>재료</h2>
        <p className="recipe-ingredients-list">
          {data.ingredients.join(", ")}
        </p>
      </div>
      
      <div className="recipe-detail-section">
        <h2>레시피</h2>
        <ol className="recipe-instructions-list">
          {data.instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="recipe-detail-section">
        <h2>요리 정보</h2>
        <div className="recipe-extra-info">
          <p><strong>유형:</strong> {data.cuisine}</p>
          <p><strong>음식특징:</strong> {data.mealType.join(", ")}</p>
          <p><strong>칼로리:</strong> {data.caloriesPerServing} kcal</p>
          <p><strong>별점:</strong> {data.rating} / 5</p>
        </div>
      </div>
    </div>
  );
}
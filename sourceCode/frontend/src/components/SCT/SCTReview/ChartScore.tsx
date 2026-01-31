import RatingBarChart from "./RatingBarChart";
import StarRating from "./StarRating";


function ChartScore() {

    const shopRating = 0;

    return (
        <div className="p-6 w-full h-full">
            <div className=" h-1/5">
                <h2 className="text-xl">คะแนนร้านค้า</h2>
                <StarRating rating={shopRating} />
            </div>
            <div className="h-4/5 mt-4 w-4/5 mx-auto">
                <RatingBarChart />
            </div>
        </div>
    )
}
export default ChartScore
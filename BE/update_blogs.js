const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fitflow_dev').then(async () => {
    console.log("Connected to MongoDB fitflow_dev");
    const db = mongoose.connection.db;

    // Blog 1
    const res1 = await db.collection('blogs').updateOne(
        { _id: new mongoose.Types.ObjectId("65f000000000000000001001") },
        { 
            $set: { 
                title: "Kinh nghiệm thuê đồ thể thao và vợt Pickleball tại Thanh Xuân",
                slug: "kinh-nghiem-thue-do-the-thao-va-vot-pickleball",
                content: "Gợi ý chọn trang phục thoáng mát, chọn size, và các mẫu vợt Pickleball/Tennis phù hợp với lối chơi.",
                updatedAt: new Date()
            } 
        }
    );
    console.log('Update 1:', res1.modifiedCount);

    // Blog 2
    const res2 = await db.collection('blogs').updateOne(
        { _id: new mongoose.Types.ObjectId("65f000000000000000001002") },
        { 
            $set: { 
                title: "Bảng giá thuê đồ thể thao & vợt 2026 (cập nhật)",
                slug: "bang-gia-thue-do-the-thao-vot-2026",
                content: "Tổng hợp mức giá thuê theo loại vợt, bóng và trang phục thể thao chuyên dụng.",
                updatedAt: new Date()
            } 
        }
    );
    console.log('Update 2:', res2.modifiedCount);

    console.log("Blogs updated successfully!");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

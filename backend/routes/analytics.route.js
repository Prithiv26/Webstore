import express from 'express'
import { userAuth, adminAuth } from '../middlewares/auth.middleware.js'
import { getAnalyticsData, getDailySalesData } from '../controllers/analytics.controller.js'

const router = express.Router()

router.get('/', userAuth, adminAuth, async (req, res) => {
    try {
        const analyticsData = await getAnalyticsData()

        const endDate = new Date();
		const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

		const dailySalesData = await getDailySalesData(startDate, endDate);

		res.json({
			analyticsData,
			dailySalesData,
		});
        
    } catch (error) {
        console.log('Error in getAnalyticsData controller')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
})

export default router
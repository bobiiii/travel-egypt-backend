const { getAllTours, getTour, addTour, updateTour,addTourData,   addIncludePoint,   addImportantInformation,
    addHighlightPoint, deleteTour,  deleteIncludePoint,
    deleteHighlightPoint, deleteImportantInformation } = require("./tourControllers")

module.exports = {
    getAllTours, getTour, addTour, updateTour, addTourData,   addIncludePoint,
    addHighlightPoint,   addImportantInformation, deleteTour,  deleteIncludePoint,
    deleteHighlightPoint, deleteImportantInformation
}
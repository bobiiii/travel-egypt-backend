const responseHandler =  (res, message,  data = null)=>{
    const response = {
        status: 'Success',
        code: 200,
        message: message,
      };
    



      if (data !== null) {
        response.data = data;
      }
      if (data === null) {
        response.data = [];
      }
      return res.status(200).json(response);
}

module.exports = {
    responseHandler
}
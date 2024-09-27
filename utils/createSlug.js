const createSlug = (name) => 
    name
      .trim()                   
      .toLowerCase()            
      .replace(/\s+/g, '-')     
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');      
  
module.exports={
    createSlug
}

  
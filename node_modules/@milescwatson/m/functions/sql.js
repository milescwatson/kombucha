var mysql = require('mysql2');

exports.executeQuery = function(query, callback){
  const pool = mysql.createPool(module.exports.dbconfig);
  pool.query(query, function(error, results, fields) {
    callback(error, results, fields);
  })
}

exports.sql = {
  executeQuery: function(query, callback){
    if(this.savedPool === null){
      this.savePool();
    }
    if(this.savedPool !== null){
      this.savedPool.query(query, function(error, results, fields) {
        callback(error, results, fields);
      })
    }else{
      throw new Error;
    }
  },
  executeQueryPool: function(query, callback){
    // For pool initialization, see above
    if(this.savedPool === null){
      this.savePool();
    }
    const savedPool = this.savedPool;
    this.savedPool.getConnection(function(err, conn) {
      conn.query(query, callback);
      this.savedPool.releaseConnection(conn);
    }.bind(this))
  },
  dbconfig: null,
  savedPool: null,
  savePool: function(){
    if(this.dbconfig !== null){
      this.savedPool = mysql.createPool(this.dbconfig)
    }
  }
}

const conn = require('../db/conectDB')
const {resolve} = require("path");

module.exports = {
    select: (offset) => {
        const select = `SELECT * FROM products LIMIT 5 OFFSET ${offset}` ;
        console.log(select)
        return new Promise((resolve, reject) => {
            conn.query(select, (err, result) => {
                if (err) throw Error(err.message);
                resolve(result);
            })
        })
    },
    add: (data) => {
        const insertSql = `INSERT INTO products(name,type,price,detail,avatarPath) VALUES('${data.name}','${data.type}',${Number(data.price)},'${data.detail}','${data.avatarPath}')`
        return new Promise((resolve, reject) => {
            conn.query(insertSql, err => {
                if (err) {
                    reject(err);
                }
                resolve('add success')
            })
        })
    },
    delete: (id) => {
        const deleteSql = `Delete FROM products where id = ${id}`;
        return new Promise((resolve, reject) => {
            conn.query(deleteSql, err => {
                if (err) reject(err)
                resolve('delete success');
            });
        });
    },
    edit: (data,id) => {
        const editSql = `UPDATE products SET name = '${data.nameEdit}',type = '${data.typeEdit}', price = ${Number(data.priceEdit)}, detail = '${data.detailEdit}', avatarPath = '${data.avatarPath}' WHERE products.id = '${id}'`;
        return new Promise((resolve, reject) => {
            conn.query(editSql, err => {
                if (err) reject(err);
                resolve('edit success');
            });
        });
    },
    getEdit: (id) => {
        const selectDataFromId = `SELECT name,type,price,detail FROM products WHERE products.id = ${id}`
        return new Promise((resolve, reject) => {
            conn.query(selectDataFromId, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    },
    addAccount: (data) => {
        const insertAccSql = `INSERT INTO account(username,email,password,password2) VALUES('${data.username}','${data.email}','${data.password}','${data.password2}')`;
        return new Promise((resolve, reject) => {
            conn.query(insertAccSql, err => {
                if (err) reject(err);
                resolve('account create success');
            })
        })
    },
    checkAccount: (data) => {
        const checkAccount = `SELECT * FROM account WHERE email = '${data.username}' AND password = '${data.password}'`;
        return new Promise((resolve, reject) => {
            conn.query(checkAccount,(err,data)=>{
                if (err) reject(err);
                resolve(data);
            })
        })

    },
    getUserName: ()=>{
        const getUserName = `SELECT username FROM account`;
        return new Promise((resolve, reject) => {
            conn.query(getUserName,(err,data)=>{
                if (err) reject(err);
                resolve(data);
            })
        })
    },
    pagination: ()=>{
        const getCount = `SELECT COUNT(id) as count from products`;
        return new Promise((resolve,reject)=>{
            conn.query(getCount,(err,data)=>{
                resolve(data)
            })
        })
    },


}
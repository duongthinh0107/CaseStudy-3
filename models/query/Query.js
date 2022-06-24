const conn = require('../db/conectDB')

module.exports = {
    select: () => {
        const select = 'SELECT * FROM products';
        return new Promise((resolve, reject) => {
            conn.query(select, (err, result) => {
                if (err) throw Error(err.message);
                resolve(result);
            })
        })
    },
    add: (data) => {
        const insertSql = `INSERT INTO products(name,type,price,detail) VALUES('${data.name}','${data.type}',${Number(data.price)},'${data.detail}')`
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
    edit: (data, id) => {
        const editSql = `UPDATE products SET name = '${data.nameEdit}',type = ${data.typeEdit}, price = ${Number(data.priceEdit)}, detail = '${data.detailEdit}' WHERE products.id = '${id}'`;
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

    }

}
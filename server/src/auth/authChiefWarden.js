const jwt = require('jsonwebtoken');
const { isValidChiefWardenId } = require("../database/operations/chiefWardenOp");

const authCW = async function (req, res, next) {
    try {
        const authHeader = req.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.send({ status: 400, message: "Token not provided or malformed" });
        }

        const token = authHeader.split(" ")[1];
        const { _id } = jwt.verify(token, process.env.SECRET_KEY);

        if (!(await isValidChiefWardenId(_id))) {
            return res.send({ status: 400, message: "You are not authorized to do this 1" });
        }

        req.cwid = _id;
        next();
    } catch (err) {
        console.error("JWT Error:", err.message);
        res.send({ status: 400, message: "You are not authorized to do this 2" });
    }
};

module.exports = { authCW };

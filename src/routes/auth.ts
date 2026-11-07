import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashed, role]
  );
  res.json({ message: 'User Added' });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows]: any = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  
  if (rows.length === 0) {
    return res.json({ message: 'User not Found' });
  }
  
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  
  if (!match) {
    return res.json({ message: 'Invalid Password' });
  }
  
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!)
  res.json({ message: 'Login Successful', token, user: { name: user.name, role: user.role } });
});
    //        Delete User
router.delete('/delete/:email', async (req, res) => {
  await db.query('DELETE FROM users WHERE email = ?', [req.params.email]);
  res.json({ message: 'User Deleted' });
});
export default router;
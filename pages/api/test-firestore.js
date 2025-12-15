import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import app from '../../firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = getFirestore(app);
    console.log('Firestore instance created on server side');
    
    // Test writing a document
    const testDocRef = doc(db, 'test', 'server-test');
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Server-side Firestore test',
      source: 'API endpoint'
    };
    
    console.log('Attempting to write test document...');
    await setDoc(testDocRef, testData);
    console.log('✅ Test document written successfully');
    
    // Test reading the document back
    console.log('Attempting to read test document...');
    const docSnap = await getDoc(testDocRef);
    
    if (docSnap.exists()) {
      console.log('✅ Test document read successfully');
      const data = docSnap.data();
      
      return res.status(200).json({
        success: true,
        message: 'Firestore test successful',
        data: data,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ Test document not found after writing');
      return res.status(500).json({
        success: false,
        message: 'Document not found after writing',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      details: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });
  }
} 
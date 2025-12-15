import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import app, { db } from "../firebase";

export async function fetchOrCreateUser(firebaseUser) {
  console.log('fetchOrCreateUser called with:', firebaseUser?.email, firebaseUser?.uid);
  
  if (!firebaseUser || !firebaseUser.uid) {
    throw new Error('Invalid Firebase user provided');
  }

  const userRef = doc(db, "users", firebaseUser.uid);
  
  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      console.log("User document already exists in Firestore:", firebaseUser.uid);
      const userData = userSnap.data();
      console.log("Existing user data:", userData);
      return userData;
    } else {
      console.log("User document does not exist, creating new one for:", firebaseUser.uid);
      
      // Assign role based on email domain
      const domain = firebaseUser.email.split("@")[1]?.toLowerCase();
      let role = "Viewer";
      if (domain === "elbrit.org") {
        role = "Editor";
      }
      
      const newUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        photoURL: firebaseUser.photoURL || null,
        role,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        customProperties: {
          organization: domain === "elbrit.org" ? "Elbrit Life Sciences" : "External User",
          accessLevel: domain === "elbrit.org" ? "full" : "limited",
          provider: firebaseUser.providerData?.[0]?.providerId || 'unknown'
        }
      };
      
      console.log("Creating new user document:", newUser);
      
      try {
        await setDoc(userRef, newUser);
        console.log("✅ User document successfully created in Firestore:", firebaseUser.uid);
        return newUser;
      } catch (setDocError) {
        console.error("❌ Error creating user document in Firestore:", setDocError);
        console.error("Error details:", {
          code: setDocError.code,
          message: setDocError.message,
          user: firebaseUser.uid,
          email: firebaseUser.email
        });
        throw setDocError;
      }
    }
  } catch (getDocError) {
    console.error("❌ Error fetching user document from Firestore:", getDocError);
    console.error("Error details:", {
      code: getDocError.code,
      message: getDocError.message,
      user: firebaseUser.uid,
      email: firebaseUser.email
    });
    throw getDocError;
  }
}

// Update Firestore user role if it differs from Plasmic
export async function updateFirestoreUserRoleIfNeeded(uid, newRole) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    if (userData.role !== newRole) {
      await updateDoc(userRef, { role: newRole });
      console.log(`Updated Firestore user role for ${uid} to ${newRole}`);
    }
  }
} 
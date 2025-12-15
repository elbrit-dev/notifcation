import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import app, { db } from "../firebase";

// Function to clean phone number by removing country code
const cleanPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  
  // Remove +91 country code if present
  let cleanedNumber = phoneNumber.replace(/^\+91/, '');
  
  // Remove any remaining + or spaces
  cleanedNumber = cleanedNumber.replace(/^\+/, '').replace(/\s/g, '');
  
  // If the number starts with 91 and is longer than 10 digits, remove the 91
  if (cleanedNumber.startsWith('91') && cleanedNumber.length > 10) {
    cleanedNumber = cleanedNumber.substring(2);
  }
  
  return cleanedNumber;
};

export async function fetchOrCreateUser(firebaseUser) {
  console.log('fetchOrCreateUser called with:', firebaseUser?.email, firebaseUser?.phoneNumber, firebaseUser?.uid);
  
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
      
      // Check if we need to update with phone user data
      let phoneUserData = null;
      if (typeof window !== 'undefined') {
        const phoneUserDataStr = localStorage.getItem('phoneUserData');
        if (phoneUserDataStr) {
          try {
            phoneUserData = JSON.parse(phoneUserDataStr);
            console.log("📱 Found phone user data for existing user:", phoneUserData);
          } catch (error) {
            console.warn("Failed to parse phone user data:", error);
          }
        }
      }
      
      // Update with phone user data if email is null or displayName is phone number
      if (phoneUserData && (!userData.email || userData.displayName === userData.phoneNumber)) {
        try {
          const updateData = {};
          
          if (!userData.email && phoneUserData.email) {
            updateData.email = phoneUserData.email;
            console.log("📧 Updating email from phone user data:", phoneUserData.email);
          }
          
          if (userData.displayName === userData.phoneNumber && phoneUserData.displayName) {
            updateData.displayName = phoneUserData.displayName;
            console.log("👤 Updating displayName from phone user data:", phoneUserData.displayName);
          }
          
          if (Object.keys(updateData).length > 0) {
            updateData.lastUpdatedAt = new Date().toISOString();
            await updateDoc(userRef, updateData);
            console.log("✅ Updated existing user with phone user data");
          }
        } catch (updateError) {
          console.warn("Failed to update existing user with phone data:", updateError);
        }
      }
      
      // Update phone number if it's not already stored (with cleaned version)
      if (firebaseUser.phoneNumber) {
        const cleanedPhoneNumber = cleanPhoneNumber(firebaseUser.phoneNumber);
        if (!userData.phoneNumber || userData.phoneNumber !== cleanedPhoneNumber) {
          try {
            await updateDoc(userRef, {
              phoneNumber: cleanedPhoneNumber,
              originalPhoneNumber: firebaseUser.phoneNumber, // Keep original for reference
              lastUpdatedAt: new Date().toISOString()
            });
            console.log("✅ Phone number updated in existing user document (cleaned):", cleanedPhoneNumber);
          } catch (updateError) {
            console.warn("Failed to update phone number in existing user:", updateError);
          }
        }
      }
      
      return userData;
    } else {
      console.log("User document does not exist, creating new one for:", firebaseUser.uid);
      
      // Check if we have phone user data from localStorage
      let phoneUserData = null;
      if (typeof window !== 'undefined') {
        const phoneUserDataStr = localStorage.getItem('phoneUserData');
        if (phoneUserDataStr) {
          try {
            phoneUserData = JSON.parse(phoneUserDataStr);
            console.log("📱 Found phone user data:", phoneUserData);
          } catch (error) {
            console.warn("Failed to parse phone user data:", error);
          }
        }
      }
      
      // Don't assign role locally - let Plasmic custom auth handle it
      let role = "Viewer"; // Default role, will be overridden by Plasmic custom auth
      let email = firebaseUser.email;
      let displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
      
      // Use phone user data if available
      if (phoneUserData) {
        email = phoneUserData.email || firebaseUser.email;
        displayName = phoneUserData.displayName || firebaseUser.displayName || email?.split('@')[0] || 'User';
        console.log("📱 Using phone user data - Email:", email, "DisplayName:", displayName);
      }
      
      // Clean phone number for storage
      const cleanedPhoneNumber = firebaseUser.phoneNumber ? cleanPhoneNumber(firebaseUser.phoneNumber) : null;
      
      const newUser = {
        uid: firebaseUser.uid,
        email: email || null,
        phoneNumber: cleanedPhoneNumber,
        originalPhoneNumber: firebaseUser.phoneNumber || null, // Keep original for reference
        displayName: displayName,
        photoURL: firebaseUser.photoURL || null,
        role, // This will be updated by Plasmic custom auth
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        customProperties: {
          organization: phoneUserData?.customProperties?.organization || "Elbrit Life Sciences",
          accessLevel: phoneUserData?.customProperties?.accessLevel || "full",
          provider: firebaseUser.providerData?.[0]?.providerId || 'unknown',
          authMethod: firebaseUser.email ? 'email' : 'phone',
          // Add employee data if available
          ...(phoneUserData?.customProperties && {
            employeeId: phoneUserData.customProperties.employeeId,
            department: phoneUserData.customProperties.department,
            designation: phoneUserData.customProperties.designation,
            dateOfJoining: phoneUserData.customProperties.dateOfJoining,
            dateOfBirth: phoneUserData.customProperties.dateOfBirth
          })
        },
        // Store employee data if available
        ...(phoneUserData?.employeeData && {
          employeeData: phoneUserData.employeeData
        })
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
          email: firebaseUser.email,
          phoneNumber: firebaseUser.phoneNumber
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
      email: firebaseUser.email,
      phoneNumber: firebaseUser.phoneNumber
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
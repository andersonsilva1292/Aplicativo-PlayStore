import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";

export interface UserProfileData {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: "student" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface UserProgressData {
  userId: string;
  lessonId: string;
  video_completed?: boolean;
  quiz_score?: number;
  quiz_attempts?: number;
  exam_score?: number;
  exam_attempts?: number;
  code_submitted?: string;
  code_draft?: string;
  pdf_opened_at?: string;
  updatedAt: string;
}

export interface SimuladoResultData {
  id: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds?: number;
  completedAt: string;
}

export interface PracticeResultData {
  id: string;
  userId: string;
  wpm: number;
  accuracy: number;
  exerciseId: string;
  completedAt: string;
}

/**
 * Checks if the current Firebase Auth user is authenticated and matches the requested userId
 */
function isFirebaseUserAuthenticated(userId?: string): boolean {
  if (!auth.currentUser) return false;
  if (!userId) return true;
  return auth.currentUser.uid === userId || auth.currentUser.email === "andersonsantosilva1292@gmail.com";
}

/**
 * Saves or updates a user profile document in Firestore
 */
export async function syncUserProfile(user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== user.uid) {
    return;
  }

  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, "users", user.uid);
    const existingSnap = await getDoc(userDocRef);

    const now = new Date().toISOString();
    if (!existingSnap.exists()) {
      const newProfile: UserProfileData = {
        id: user.uid,
        email: user.email || "",
        displayName: user.displayName || user.email?.split("@")[0] || "Aluno",
        photoURL: user.photoURL || "",
        role: user.email === "andersonsantosilva1292@gmail.com" ? "admin" : "student",
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userDocRef, newProfile);
    } else {
      await updateDoc(userDocRef, {
        displayName: user.displayName || existingSnap.data()?.displayName || "Aluno",
        photoURL: user.photoURL || existingSnap.data()?.photoURL || "",
        updatedAt: now,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  if (!isFirebaseUserAuthenticated(userId)) {
    return null;
  }

  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? (snap.data() as UserProfileData) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Persists lesson progress to Firestore
 */
export async function saveUserProgress(userId: string, lessonId: string, progress: Partial<UserProgressData>): Promise<void> {
  if (!isFirebaseUserAuthenticated(userId)) {
    return;
  }

  const path = `users/${userId}/progress/${lessonId}`;
  try {
    const docRef = doc(db, "users", userId, "progress", lessonId);
    const snap = await getDoc(docRef);
    const now = new Date().toISOString();

    if (!snap.exists()) {
      const data: UserProgressData = {
        userId,
        lessonId,
        video_completed: progress.video_completed ?? false,
        quiz_score: progress.quiz_score ?? 0,
        quiz_attempts: progress.quiz_attempts ?? 0,
        exam_score: progress.exam_score ?? 0,
        exam_attempts: progress.exam_attempts ?? 0,
        code_submitted: progress.code_submitted ?? "",
        code_draft: progress.code_draft ?? "",
        pdf_opened_at: progress.pdf_opened_at ?? "",
        updatedAt: now,
      };
      await setDoc(docRef, data);
    } else {
      await updateDoc(docRef, {
        ...progress,
        updatedAt: now,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads all lesson progress for a user
 */
export async function getAllUserProgress(userId: string): Promise<UserProgressData[]> {
  if (!isFirebaseUserAuthenticated(userId)) {
    return [];
  }

  const path = `users/${userId}/progress`;
  try {
    const snap = await getDocs(collection(db, "users", userId, "progress"));
    return snap.docs.map((d) => d.data() as UserProgressData);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Records a completed simulado exam result in Firestore
 */
export async function saveSimuladoResult(userId: string, result: Omit<SimuladoResultData, "id" | "userId">): Promise<void> {
  if (!isFirebaseUserAuthenticated(userId)) {
    return;
  }

  const id = `sim_${Date.now()}`;
  const path = `users/${userId}/simulados/${id}`;
  try {
    const docRef = doc(db, "users", userId, "simulados", id);
    const data: SimuladoResultData = {
      id,
      userId,
      ...result,
    };
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Loads recent simulados history for a user
 */
export async function getSimuladosHistory(userId: string): Promise<SimuladoResultData[]> {
  if (!isFirebaseUserAuthenticated(userId)) {
    return [];
  }

  const path = `users/${userId}/simulados`;
  try {
    const q = query(collection(db, "users", userId, "simulados"), orderBy("completedAt", "desc"), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SimuladoResultData);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Saves a typing practice score to Firestore
 */
export async function savePracticeResult(userId: string, result: Omit<PracticeResultData, "id" | "userId">): Promise<void> {
  if (!isFirebaseUserAuthenticated(userId)) {
    return;
  }

  const id = `prac_${Date.now()}`;
  const path = `users/${userId}/practice/${id}`;
  try {
    const docRef = doc(db, "users", userId, "practice", id);
    const data: PracticeResultData = {
      id,
      userId,
      ...result,
    };
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

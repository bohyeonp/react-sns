import store from "../app/store";
import {auth, firestore} from "../firebase/Firebase";
import {setImageList, setModalDefault, setUserProfile} from "../app/slice";
import {createUserWithEmailAndPassword, deleteUser, EmailAuthProvider, updatePassword, reauthenticateWithCredential} from "firebase/auth";

const user = firestore.collection("user");
const post = firestore.collection("post");

export const createUserWithEmailAndPasswordApi = (values) => {
    const {email, password} = values.user;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const userInfo = userCredential.user;
            user.doc(userInfo.uid).set({
                ...values.user,
                photoNum : "0",
                list : {
                    cart : [],
                    post : [],
                    purchase : []
                }
            });
        })
        .catch((error) => {
            switch(error.code){
                case "auth/email-already-in-use":
                    store.dispatch(setModalDefault({show: true, type: "email-already-in-use"}));
                    break;
                default:
                    store.dispatch(setModalDefault({show: true, type: "join-fail"}));
                    break;
            }
        });
};

export const deleteUserApi = () => {
    const userProfile = store.getState().user.userProfile;
    const credential = EmailAuthProvider.credential(userProfile.email, userProfile.password);

    deleteUser(auth.currentUser).then(() => {
        user.doc(userProfile.uid).delete();
    }).catch((error) => {
        reauthenticateWithCredential(auth.currentUser, credential).then(() => {
            deleteUserApi()
        }).catch((error) => {
            store.dispatch(setModalDefault({show: true, type: "delete-fail"}));
        });
    });
};

export const updatePasswordApi = (password) => {
    const userProfile = store.getState().user.userProfile;
    const credential = EmailAuthProvider.credential(userProfile.email, password.current);

    updatePassword(auth.currentUser, password.new).then(() => {
        user.doc(userProfile.uid).update({ password : password.new});
        store.dispatch(setModalDefault({show: true, type: "pw-update-success"}));
    }).catch((error) => {
        reauthenticateWithCredential(auth.currentUser, credential).then(() => {
            updatePasswordApi(password)
        }).catch((error) => {
            store.dispatch(setModalDefault({show: true, type: "pw-update-fail"}));
        });
    });
};

export const updateProfileApi = (values) => {
    const {name, email, photo, birth, phone} = values.user;
    const uid = store.getState().user.userProfile.uid;

    user.doc(uid).update({
        name : name,
        //email: email,
        photoNum : photo,
        birth : birth || "",
        phone : phone || ""
    }).then(() => {
        store.dispatch(setModalDefault({show: true, type: "profile-update-success"}));
        reProfileApi();
    });
};

export const reProfileApi = (userId) => {
    const uid = userId || store.getState().user.userProfile.uid;

    user.doc(uid).get().then((doc)=> {
        store.dispatch(setUserProfile({...doc.data(), ...{uid : uid}}));
    })
};

export const getPostApi = (params, callback) => {
    let imageList = [];

    return post.get().then((doc) => {
        doc.forEach((docs)=>{
            imageList.push(docs.data())
        })
        store.dispatch(setImageList(imageList))
        callback("", true);
    });
};

export const uploadPostApi = (values) => {
    const userProfile = store.getState().user.userProfile;
    const postData = [...userProfile.list.post, values]

    user.doc(userProfile.uid).update({list : {...userProfile.list, post : [...postData]}}).then(() => {
        store.dispatch(setModalDefault({show: true, type: "post-upload-success"}));
        reProfileApi();
        post.doc(values.id).set(values)
    });
};

export const getAdDetailApi = (id, callback) => {
    return post.doc(id).get().then((doc) => {
        callback("", doc.data());
    });
};

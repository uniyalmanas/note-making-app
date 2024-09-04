import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from 'react-icons/md';
import AddEditNotes from "./AddEditNotes";
import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import moment from 'moment';
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import AddNotesImg from "../../assets/images/no-data.avif";

// Ensure Modal is attached to the app element
Modal.setAppElement('#root');

const Home = () => {
    const [openAddEditModal, setOpenAddEditModal] = useState({
        isShow: false,
        type: "Add",
        data: null,
    });
    
    const [showToastMsg, setshowToastMsg] = useState({
        isShown: false,
        type: "Add",
        message: ""
    });
    const [userInfo, setUserInfo] = useState(null);
    const [allNotes, setAllNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Initial loading state
    const navigate = useNavigate();

    const [isSearch, setisSearch] = useState(false)

    const handleEdit = (noteDetails) => {
        setOpenAddEditModal({ isShow: true, data: noteDetails, type: "edit" });
      };

        const showToastMessage =(message,type)=>{
        setshowToastMsg({
            isShown: true,
            message,
            type
        })
    }
    const handleCloseToast =(message,type)=>{
        setshowToastMsg({
            isShown: true,
            message,
            type
        })
    }
  // search a note
// Search for a Note
const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { search: query }, // Changed from 'query' to 'search'
      });
  
      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  };
  


    // Get User Info
    const getUserInfo = async () => {
        try {
            setIsLoading(true); // Set loading state to true
            const response = await axiosInstance.get("/get-user");
            setUserInfo(response.data.user);
        } catch (error) {
            if (error.response.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
        } finally {
            setIsLoading(false); // Set loading state to false after fetching or error
        }
    };

    // Get all notes
    const getAllNotes = async () => {
        try {
            const response = await axiosInstance.get("/get-all-notes");

            if (response.data && response.data.notes) {
                setAllNotes(response.data.notes);
            }
        } catch (error) {
            console.log("An unexpected error occurred. Please try again.");
        }
    };

    useEffect(() => {
        getAllNotes();
        getUserInfo();
    }, []);

    // Delete Node 
const deleteNote = async (data) => {
    const noteId = data._id;
  
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);
  
      if (response.data && !response.data.error) {
        showToastMessage("Note deleted Successfully", `delete`);
        getAllNotes();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error occurred. Please try again.");
    }
    }
  };
  
  useEffect(() => {
    getAllNotes();
    getUserInfo();
  }, []);


    return (
        <>
            <Navbar userInfo={userInfo} onSearchNote={onSearchNote}/>

            <div className="container mx-auto">
            {allNotes.length > 0 ? (
  <div className="grid grid-cols-3 gap-4 mt-8">
    {allNotes.map((item, index) => (
      <NoteCard
        key={item._id}
        title={item.title}
        date={item.createdOn}
        content={item.content}
        tags={item.tags}
        isPinned={item.isPinned}
        onEdit={() => handleEdit(item)}
        onDelete={() => deleteNote(item)}
        onPinNote={() => {}}
      />
    ))}
  </div>
) : (
  <EmptyCard imgSrc={AddNotesImg} message={'Start creating your first note! Click the ADD button to create a NOTE'}/>
)}
            </div>

            {/* Button to open modal */}
            <button
                className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
                onClick={() => {
                    setOpenAddEditModal({
                        isShow: true,
                        type: "Add",
                        data: null,
                    });
                }}
            >
                <MdAdd className='text-[32px] text-white' />
            </button>

            {/* Modal for adding or editing notes */}
            <Modal
                isOpen={openAddEditModal.isShow}
                onRequestClose={() => setOpenAddEditModal({ ...openAddEditModal, isShow: false })}
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    },
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        width: '60%',
                        maxHeight: '75%',
                        padding: '20px',
                        overflow: 'auto',
                    },
                }}
                contentLabel="Add/Edit Note"
            >
                <AddEditNotes
                    type={openAddEditModal.type}
                    noteData={openAddEditModal.data}
                    onClose={() => {
                        setOpenAddEditModal({ isShow: false, type: "Add", data: null });
                    }}
                    getAllNotes={getAllNotes}
                    showToastMessage={showToastMessage}
                />
            </Modal>

            <Toast
            isShown={showToastMsg.isShown}
            message={showToastMsg.message}
            type={showToastMsg.type}
            onClose={handleCloseToast}
            ></Toast>
        </>
    );
};

export default Home;
 
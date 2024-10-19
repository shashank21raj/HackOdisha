import React, { useEffect, useState } from "react";
import { db,storage } from "../firebase";
import {v4} from 'uuid';
import {getDownloadURL,uploadBytes,ref } from "firebase/storage";
import {collection,addDoc,getDocs}from 'firebase/firestore'

// Card Form Modal Component
const PeopleFormModal = ({ setShowModal, addPerson, cardNumber }) => {
  const [formData, setFormData] = useState({
    holderName: "",
    cardNumber: cardNumber,
    imageSrc: "",
  });

  const [imageUpload, setImageUpload] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (imageUpload) {
        const filename = v4() + "-" + imageUpload.name;
        const uploadRef = ref(storage, filename);
        
        await uploadBytes(uploadRef, imageUpload);
        console.log("Image uploaded successfully");
  
        const url = await getDownloadURL(uploadRef);
  
        const docRef = await addDoc(collection(db, 'people'), {
          cardnumber: formData.cardNumber,
          holderName: formData.holderName,
          imageSrc: url,
        });
        addPerson({
          cardnumber: formData.cardNumber,
          holderName: formData.holderName,
          imageSrc: url,
        });
        console.log("Document written with ID: ", docRef.id);
      }
  
      setShowModal(false);
    } catch (error) {
      console.error("Error in adding person to Firestore: ", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center">
      <div className="w-4/5 p-8 bg-white rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Add New Person to Card {cardNumber}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Card Holder's Name
            </label>
            <input
              type="text"
              name="holderName"
              value={formData.holderName}
              onChange={handleChange}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700"
              placeholder="John Doe"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Image Src
            </label>
            <input
              type="file"
              name="image"
              value={formData.imageSrc}
              onChange={(event)=>{setImageUpload(event.target.files[0])}}
              className="appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded-full"

            >
              Submit
            </button>
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded-full"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const UserProfileContainer = () => {
  const [currentHover, setCurrentHover] = useState(null);
  const [imageHover, setImageHover] = useState(null);
  const [selectedCard, setSelectedcard] = useState(null);
  const [people, setPeople] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCardNumber, setCurrentCardNumber] = useState("");

  const cardData = [
    {
      id: 1,
      cardNumber: "2104568",
      holderName: "John Doe",
      cardType: "Debit Card",
    },
    {
      id: 2,
      cardNumber: "2104569",
      holderName: "Jane Smith",
      cardType: "Credit Card",
    },
    {
      id: 3,
      cardNumber: "2104570",
      holderName: "Alice Brown",
      cardType: "MasterCard",
    },
  ];

  const deletePerson=(id)=>{
    setPeople(prevPeople=>prevPeople.filter(person=>person.cardId!==id))
  }
  const addPerson = (newPerson) => {
    setPeople((prevPeople) => [...prevPeople, newPerson]);
  };
  
  useEffect(()=>{
    const getAllPeopleData=async()=>{
      try {
        const snapshot=await getDocs(collection(db,'people'));
        const peopleData=snapshot.docs.map(doc=>({
          cardnumber:doc.data().cardnumber,
          holderName:doc.data().holderName,
          imageSrc:doc.data().imageSrc,
        }))
        setPeople(peopleData);
        console.log("Data fetched successfully",peopleData)
      } catch (error) {
        console.log("Error in fetching the data",error)
      }
    }
    getAllPeopleData();
  },[])


  return (
    <div className="h-screen bg-purple-300">
      <div className="flex justify-center items-center">
        <div className="flex overflow-x-auto space-x-6">
          {cardData.map((card) => (
            <div
              key={card.id}
              className="relative p-4 m-4 w-80 h-48 rounded-md bg-purple-200 shadow-lg cursor-pointer hover:bg-purple-300 hover:shadow-2xl"
              onMouseEnter={() => setCurrentHover(card.cardNumber)}
              onMouseLeave={() => setCurrentHover(null)}
              onClick={() => {
                setSelectedcard(card.cardNumber);
              }}
            >
              <div className="w-full h-full p-4 bg-purple-100 rounded-lg shadow-md">
                <div className="flex flex-col items-start">
                  <span className="text-xl font-bold text-gray-800">
                    {card.cardType}
                  </span>
                  <span className="text-gray-600 mt-2">{card.cardNumber}</span>
                  <span className="text-sm text-gray-500 mt-4">
                    Cardholder: {card.holderName}
                  </span>
                </div>
              </div>

              {/* Add and Delete buttons only visible on hover */}
              {currentHover === card.cardNumber && (
                <div className="absolute bottom-4 right-4 space-x-2">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() => {
                      setShowModal(true);
                      setCurrentCardNumber(card.cardNumber);
                    }}
                  >
                    Add
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => {
                      // Add your delete logic here
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedCard && (
        <div className="mt-10 flex justify-center">
          {people
            .filter((person) => person.cardnumber === selectedCard)
            .map((person, index) => (
              <div
                key={index}
                className="relative m-4"
                onMouseEnter={() => setImageHover(index)}
                onMouseLeave={() => setImageHover(null)}
              >
                <img
                  src={person.imageSrc}
                  alt={`${person.holderName}`}
                  className="w-32 h-32"
                />
                {imageHover === index && (
                  <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 rounded-full">
                    <button className="text-white" onClick={()=>deletePerson(person.cardId)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="h-4 w-4"
                      >
                        <path
                          stroke-linecap=""
                          stroke-linejoin=""
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {showModal && (
        <PeopleFormModal
          setShowModal={setShowModal}
          addPerson={addPerson}
          cardNumber={currentCardNumber} // Pass the card number to the modal
        />
      )}
    </div>
  );
};

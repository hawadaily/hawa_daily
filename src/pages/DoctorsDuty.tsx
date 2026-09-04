import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import React from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Doctor {
  name: string;
  specialization: string;
  time: string;
}

interface Clinic {
  id: string;
  name: string;
  nameDv: string;
  address: string;
  addressDv: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
    googleMapsUrl: string;
  };
  doctors: Doctor[];
}

const clinicsData: Clinic[] = [
  // Male' Clinics
  {
    id: '1',
    name: 'Indhira Gandhi Memorial Hospital',
    nameDv: 'އިންދިރާ ގާންދީ މެމޯރިއަލް ހޮސްޕިޓަލް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3322224',
    location: {
      lat: 4.1755,
      lng: 73.5093,
      googleMapsUrl: 'https://maps.google.com/?q=Indhira+Gandhi+Memorial+Hospital+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Subash', specialization: 'Consultant Radiology', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Nazeer', specialization: 'Senior Consultant Radiology', time: '08:00 - 16:00' },
      { name: 'Dr. Aishath Naura', specialization: 'Senior Specialist Registrar Radiology', time: '08:00 - 16:00' },
      { name: 'Dr. Mariyam Irufa Musthafa', specialization: 'Senior Specialist Registrar Radiology', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Hasna Mohamed', specialization: 'Consultant Radiology', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Serour Nasr Mansour', specialization: 'Consultant Ophthalmology', time: '08:00 - 16:00' },
      { name: 'Dr. Ibrahim Shiham', specialization: 'Senior Consultant Nephrology', time: '08:00 - 16:00' },
      { name: 'Dr. Ibrahim Misbah', specialization: 'Consultant Urology', time: '08:00 - 16:00' },
      { name: 'Dr. Ibthisaam Ibrahim', specialization: 'Senior Specialist Registrar Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Zooshan', specialization: 'Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Rasheed', specialization: 'Senior Consultant Neurology', time: '08:00 - 16:00' },
      { name: 'Dr. Ibrahim Faisal', specialization: 'Consultant Endocrinology', time: '08:00 - 16:00' },
      { name: 'Dr. Aung Kyaw Thu', specialization: 'Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Abdulla Isneen Hilmy', specialization: 'Consultant Gastroenterology', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Mohamed', specialization: 'Senior Specialist Registrar Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Hassan Shafeeq', specialization: 'Senior Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Su Myat Pyae', specialization: 'Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Nihla Ali Rasheed', specialization: 'Senior Specialist Registrar Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Afaa Mohamed', specialization: 'Senior Specialist Registrar', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Nadiyaa', specialization: 'Senior Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Hafsa Mohamed', specialization: 'Senior Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Jinah Ahmed', specialization: 'Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Zubair Mohamed Didi', specialization: 'Senior Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Shamaa Shareef', specialization: 'Consultant Obstetrics & Gynaecology', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Mufliha', specialization: 'Senior Consultant Radiology', time: '08:00 - 16:00' },
      { name: 'Dr. Basma Ibrahim Sobir', specialization: 'Senior Consultant Radiology', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Arifa', specialization: 'Senior Consultant Radiology', time: '08:00 - 16:00' },
      { name: 'Dr. Shoaib Ahmad', specialization: 'Consultant ENT', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Hassan Ahmed AbdelKader', specialization: 'Consultant Bio-Chemistry', time: '08:00 - 16:00' },
      { name: 'Dr. Gunjan Khadka', specialization: 'Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Seena', specialization: 'Consultant ENT', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Zahra', specialization: 'Consultant Obstetrics & Gynaecology', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Abdulla Zuhair', specialization: 'Consultant Obstetrics & Gynaecology', time: '08:00 - 16:00' },
      { name: 'Dr. Ali Nazeem', specialization: 'Senior Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Ali Abdulla Latheef', specialization: 'Senior Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Rajib Kumar Dey', specialization: 'Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Moosa Murad', specialization: 'Senior Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Migdhaadh', specialization: 'Senior Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Sham', specialization: 'Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Asma', specialization: 'Consultant Anesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Aishath Shibana Ahmed', specialization: 'Senior Consultant Obstetrics & Gynaecology', time: '08:00 - 16:00' },
      { name: 'Dr. Hana Nooh', specialization: 'Consultant ENT', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Shoora', specialization: 'Consultant ENT', time: '08:00 - 16:00' },
      { name: 'Dr. Shimna Gasim', specialization: 'Dental Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Adam Ismail', specialization: 'Dental Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Shirmeen Mohamed', specialization: 'Senior Consultant Obstetrics & Gynaecology', time: '08:00 - 16:00' },
      { name: 'Dr. Fatimath Shazma Rameez', specialization: 'Consultant Obstetrics & Gynaecology', time: '08:00 - 16:00' },
      { name: 'Dr. Eeman Mohamed', specialization: 'Dental Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Shimal Thasneem', specialization: 'Senior Consultant Pathology', time: '08:00 - 16:00' },
      { name: 'Dr. Milza Abdul Muhsin', specialization: 'Senior Consultant Pathology', time: '08:00 - 16:00' },
      { name: 'Dr. Sandeep Raj Dahal', specialization: 'Consultant Pathology', time: '08:00 - 16:00' },
      { name: 'Dr. Thet Wai Kyaw', specialization: 'Consultant Pathology', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Sunil', specialization: 'Consultant Cardiology', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Mausool Siraj', specialization: 'Consultant Cardiology', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Shareef Abdul Majeed', specialization: 'Senior Consultant Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Abdulla Ubaid', specialization: 'Senior Consultant Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Aishath Azna Ali', specialization: 'Consultant Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Afnan Mohsen Sami Abdelhamid Zaki', specialization: 'Consultant Neurosurgery', time: '08:00 - 16:00' },
      { name: 'Dr. Mubbashir Ali Baig', specialization: 'Consultant Neurosurgery', time: '08:00 - 16:00' },
      { name: 'Dr. Chandra Prakash Yadav', specialization: 'Consultant Neurosurgery', time: '08:00 - 16:00' },
      { name: 'Dr. Ali Niyaf', specialization: 'Senior Consultant Neuro-Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Myintzu Thaw', specialization: 'Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Amru Ahmed', specialization: 'Consultant Oncology', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Shifan', specialization: 'Consultant Onco Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Mariyam Yoomy', specialization: 'Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Jemal Girma Mohammed', specialization: 'Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Ali Abbas Murshed Abuabdallah', specialization: 'Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Mahmoud Sami Ahmed Hussein', specialization: 'Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Hussain Faisal', specialization: 'Senior Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Ismail Zahir', specialization: 'Senior Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Sushil Kumar Thakur', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Si Thu Hein', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Phyo Thu Han', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Muhammad Waqas', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Mihunath Musthafa', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Ibrahim Abdelghafar Darweesh', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Elsayed', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Sinaanath Hussain', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Hamsa Arif Rasheed', specialization: 'Senior Specialist Registrar Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Shree Krishna', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Minna Hussain', specialization: 'Senior Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Samahath', specialization: 'Consultant Pediatric Neurology', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Saeed', specialization: 'Senior Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Azzam', specialization: 'Consultant Vitreo-Retinal Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmad Alkamel Hamed Mosa', specialization: 'Consultant Ophthalmology', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Saleem', specialization: 'Consultant Ophthalmology', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Shaamaly Jaufar', specialization: 'Senior Consultant Ophthalmology', time: '08:00 - 16:00' },
      { name: 'Dr. Suu Lai Khine', specialization: 'Consultant General Practice', time: '08:00 - 16:00' },
      { name: 'Dr. Fahira Ahmed Rasheed', specialization: 'Consultant Emergency Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Zeyba Ahmed', specialization: 'Senior Consultant Emergency Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Nandana Welage', specialization: 'Occupational Therapist', time: '08:00 - 16:00' },
      { name: 'Ms. Maryam Shafa Shareef', specialization: 'Physiotherapist', time: '08:00 - 16:00' },
      { name: 'Ms. Noorul-Uyoon Ahmed Ibrahim Didi', specialization: 'Physiotherapist', time: '08:00 - 16:00' },
      { name: 'Ms. Aagila Rasheedh', specialization: 'Physiotherapist', time: '08:00 - 16:00' },
      { name: 'Ms. Sakunthala Chandrasekar', specialization: 'Physiotherapist', time: '08:00 - 16:00' },
      { name: 'Mr. Ajay Rajeev Madathil', specialization: 'Physiotherapist', time: '08:00 - 16:00' },
      { name: 'Ms. Bincy Grace Varghese', specialization: 'Physiotherapist', time: '08:00 - 16:00' },
      { name: 'Ms. Fathimath Rukha Shiham', specialization: 'Physiotherapist', time: '08:00 - 16:00' },
      { name: 'Ms. Layan Ali Rasheed', specialization: 'Senior Physiotherapist', time: '08:00 - 16:00' },
      { name: 'Ms. Aishath Rizma Rasheed', specialization: 'Senior Physiotherapist', time: '08:00 - 16:00' },
      { name: 'Mr. Jismon Joy', specialization: 'Senior Physiotherapist', time: '08:00 - 16:00' },
      { name: 'Dr. Hazumath Waheedha', specialization: 'Dental Officer', time: '08:00 - 16:00' },
      { name: 'Ms. Hawwa Riyasa', specialization: 'Physiotherapist', time: '08:00 - 16:00' },
      { name: 'Dr. Hawwa Majda', specialization: 'Dental Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Nafiz Ahmed', specialization: 'Senior Specialist Registrar Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Malaka Adhil', specialization: 'Dental Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Shaufa Waheed', specialization: 'Dental Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Khaulath Mohamed', specialization: 'Senior Dental Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Lae Lae Zaw', specialization: 'Consultant Emergency Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Aref Saber Mahmoud', specialization: 'Consultant Respiratory Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Nasheed', specialization: 'Senior Specialist Registrar Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Piyush Niroula', specialization: 'Consultant Neurology', time: '08:00 - 16:00' },
      { name: 'Dr. Ali Mafaz Rasheed', specialization: 'Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Santosh Kumar Kalla', specialization: 'Consultant Psychiatry', time: '08:00 - 16:00' },
      { name: 'Dr. Fathmath Iyaany Abdul Matheen', specialization: 'Senior Specialist Registrar Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Dileep Kumar Lohano', specialization: 'Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Than Dar Su Hlaing', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Aishath Reema', specialization: 'Senior Consultant Dermatology', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Luhushan', specialization: 'Senior Consultant Dermatology', time: '08:00 - 16:00' },
      { name: 'Dr. Nashwa Ahmed', specialization: 'Consultant Dermatology', time: '08:00 - 16:00' },
      { name: 'Dr. Mahfooza Moosa', specialization: 'Senior Consultant Dermatology', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Haikal Abdul Rahman', specialization: 'Senior Consultant Dermatology', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmad Hisham Abdelhalim Ali', specialization: 'Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Samee Ali', specialization: 'Consultant ENT', time: '08:00 - 16:00' },
      { name: 'Dr. Yi Mon Thant', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Aishath Eleena', specialization: 'Senior Consultant Pediatric Cardiology', time: '08:00 - 16:00' },
      { name: 'Dr. Nway Nway Theint Zaw', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Waheed', specialization: 'Consultant Plastic Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Mariyam Niyaz', specialization: 'Consultant Endocrinology', time: '08:00 - 16:00' },
      { name: 'Dr. Ibrahim Sujau', specialization: 'Consultant Rheumatology', time: '08:00 - 16:00' },
      { name: 'Dr. Mariyam Shahana Mufeed', specialization: 'Consultant Ophthalmology', time: '08:00 - 16:00' },
      { name: 'Dr. Hiyan Habeeb', specialization: 'Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Ali Shafeeq', specialization: 'Consultant Cardiology', time: '08:00 - 16:00' },
      { name: 'Dr. Mariyam Efa Abdul Gafoor', specialization: 'Consultant Endodontics', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Ihusana', specialization: 'Consultant Radiology', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Muthuim', specialization: 'Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Fathuhulla Saeed', specialization: 'Consultant Oral And Maxillo Facial Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Mariyam Mahiya', specialization: 'Consultant Endodontics', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Abdulla', specialization: 'Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Nadheema Rasheed', specialization: 'Consultant Orthodontics', time: '08:00 - 16:00' },
      { name: 'Dr. Abdulla Adsar', specialization: 'Consultant Urology', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Shaneez Najmy', specialization: 'Consultant Cardiology', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Shifaz', specialization: 'Consultant ENT', time: '08:00 - 16:00' },
      { name: 'Ms. Teena Thomas', specialization: 'Speech-Language Pathologist', time: '08:00 - 16:00' },
      { name: 'Ms. Shilpa Elsa Prasad', specialization: 'Speech-Language Pathologist', time: '08:00 - 16:00' },
      { name: 'Ms. Elza Philip', specialization: 'Senior Speech-Language Pathologist', time: '08:00 - 16:00' },
      { name: 'Dr. Farzana Shaugee', specialization: 'Senior Consultant Speech-Language Pathologist', time: '08:00 - 16:00' },
      { name: 'Dr. Meeza Haany', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Niyasha Ibrahim Mohamed', specialization: 'Senior Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Faisal', specialization: 'Consultant Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Sausan Naseem', specialization: 'Consultant Emergency Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Abdelwahed Mohamed Bayomy', specialization: 'Consultant Respiratory Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Ali', specialization: 'Consultant Internal Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Ismail', specialization: 'Senior Consultant Respiratory Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Bina Sing Gurgung', specialization: 'Consultant Psychiatry', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Shauna', specialization: 'Senior Specialist Registrar Psychiatry', time: '08:00 - 16:00' },
      { name: 'Dr. Fatima Riaz', specialization: 'Consultant Psychiatry', time: '08:00 - 16:00' },
      { name: 'Dr. Abdulla Nazim', specialization: 'Consultant Psychiatry', time: '08:00 - 16:00' },
      { name: 'Dr. Shooga Moosa', specialization: 'Consultant Psychiatry', time: '08:00 - 16:00' },
      { name: 'Dr. Khadheejath Saamira', specialization: 'Consultant Psychiatry', time: '08:00 - 16:00' },
      { name: 'Dr. Arif Mohamed', specialization: 'Consultant Psychiatry', time: '08:00 - 16:00' },
      { name: 'Dr. Shanooha Mansoor', specialization: 'Senior Consultant Psychiatry', time: '08:00 - 16:00' },
      { name: 'Dr. Prakriti Kunwar', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Hafiz Adil Umer', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Praynjal Pakhrin', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Muhammad Ibrahim Zaka', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Amira Salaama Mohamed Mohamed Ibrahim', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Syed Imtiaz Ali Zaidi', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Sandar Shune Let Aung', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Muhammad Owais', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Bishan Limbu', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Saindra Shrestha', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Abdul Shakoor', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Sadhima Rasheed', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Zulaikha Maee', specialization: 'Senior Consultant Anaesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Asadh Mohamed Shaheed', specialization: 'Consultant Anaesthesiology', time: '08:00 - 16:00' },
    ]
  },
  {
    id: '2',
    name: 'ADK Hospital',
    nameDv: 'އޭޑީކޭ ހޮސްޕިޓަލް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3301333',
    location: {
      lat: 4.1720,
      lng: 73.5080,
      googleMapsUrl: 'https://maps.google.com/?q=ADK+Hospital+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Aamaal Najeeb', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Abdikadir Hassan Hussein', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Abdulla Niyaf', specialization: 'Senior Consultant Pediatrics & Diving Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Abdullah Afnan Ahmed', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Adam Khaleel Yoosuf', specialization: 'Senior Consultant Pathologist', time: '08:00 - 16:00' },
      { name: 'Dr. Afaa Adam', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Afaaf Ahmed', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Muaan', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Nishan', specialization: 'Senior Consultant Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Saif', specialization: 'Consultant Endocrinology', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Shamveel Ibrahim', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Ahmed Ziyan', specialization: 'Senior Consultant Emergency Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Aishath Jeneena Amir', specialization: 'Consultant Ophthalmology', time: '08:00 - 16:00' },
      { name: 'Dr. Aishath Maashy Ibrahim', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Aishath Shaffaf Ahmed', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Aishath Wilaya', specialization: 'Consultant Emergency Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Aishath Ziyan', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Ifasha Gasim', specialization: 'Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Lamha Ali', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Nahuza', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Nazaaha', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Samha', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Shanaz Adil', specialization: 'Consultant Pediatric Gastroenterology', time: '08:00 - 16:00' },
      { name: 'Dr. Aminath Shaufa', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Anisha Basnet', specialization: 'Consultant Anesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Anjana K C', specialization: 'Consultant Pathology', time: '08:00 - 16:00' },
      { name: 'Dr. Anupama Bhattarai', specialization: 'Consultant Obstetrics & Gynaecology', time: '08:00 - 16:00' },
      { name: 'Dr. Anusha Bajracharya Gubhaju', specialization: 'Consultant Ophthalmology', time: '08:00 - 16:00' },
      { name: 'Dr. Areej Abdulla', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Ashish Kailashchandra Nema', specialization: 'Senior Consultant Cardiology', time: '08:00 - 16:00' },
      { name: 'Dr. Ashok Kharel', specialization: 'Senior Consultant Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Azam Farish', specialization: 'Consultant Radiology', time: '08:00 - 16:00' },
      { name: 'Dr. Bhumika Pradhan', specialization: 'Consultant Nephrology', time: '08:00 - 16:00' },
      { name: 'Dr. Binod Gautam', specialization: 'Senior Consultant Anesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Budhi Nath Adhikari Sudhin', specialization: 'Senior Consultant Plastic Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Dharmesh Ramniklal Bhatti', specialization: 'Senior Consultant Gynaecology', time: '08:00 - 16:00' },
      { name: 'Dr Ahmed Abdulla', specialization: 'Consultant Internal Medicine', time: '08:00 - 16:00' },
      { name: 'Dr Aishath Soifa Shareef', specialization: 'Consultant Anesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr Saurav Kumar', specialization: 'Consultant Psychiatry', time: '08:00 - 16:00' },
      { name: 'Dr Sudhir Kumar Yadav', specialization: 'Senior Consultant Radiology', time: '08:00 - 16:00' },
      { name: 'Dr Swikriti Koirala', specialization: 'Consultant Community Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Dusooma Abdul Razzag', specialization: 'Senior Consultant Anesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Fahudha Sayd', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Leeshiya Ahmed', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Nasiha', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Saazleen', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Shazoo', specialization: 'Consultant Internal Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Fathimath Zuwaida', specialization: 'Consultant Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Fathmath Shudhfa Ibrahim', specialization: 'Consultant Radiology', time: '08:00 - 16:00' },
      { name: 'Dr. Fathmath Zail Azmeel', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Firdhaus Rasheed', specialization: 'Dentist', time: '08:00 - 16:00' },
      { name: 'Dr. Gashshaanath Abdul Wahhab', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Hanaan Shafeeg', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Hawwa Shareef', specialization: 'Consultant Pediatric Neurology', time: '08:00 - 16:00' },
      { name: 'Dr. Hussain Shakeel', specialization: 'Senior Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Ismail Ejaz Ali', specialization: 'Consultant Paediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Iujaz Hamzah', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Jahangir Ahmad Sheikh', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Kiran Aryal', specialization: 'Consultant Microbiology', time: '08:00 - 16:00' },
      { name: 'Dr. Kiran Niraula', specialization: 'Senior Consultant Neurosurgery', time: '08:00 - 16:00' },
      { name: 'Dr. Leena Saleem', specialization: 'Consultant Obstetrics & Gynaecology', time: '08:00 - 16:00' },
      { name: 'Dr. Malay Halder Plabon', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Manal Visam', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Mariyam Nashwa Naseem', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Mariyam Shazna', specialization: 'Consultant Obstetrics & Gynaecology', time: '08:00 - 16:00' },
      { name: 'Dr. Mariyam Thooba Mohamed', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Maryam Sana', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Mauroof Wisam', specialization: 'Consultant Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Mauroofa Abdul Latheef', specialization: 'Consultant ENT', time: '08:00 - 16:00' },
      { name: 'Dr. Moataz Ayman Saleh Abdelaziz', specialization: 'Senior Consultant Cardiothoracic Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Aarish', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Elshaarawi Mohamed Youssif', specialization: 'Consultant Anesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Hisan Hayyu', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Mazin Ilyas', specialization: 'Dentist', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Mishwar Ashfaq', specialization: 'Senior Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Razzan Rameez', specialization: 'Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Shafiu', specialization: 'Senior Consultant Cardiothoracic Surgery', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Shafraz', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Mohamed Zaidan Adil', specialization: 'Consultant Neurosurgery', time: '08:00 - 16:00' },
      { name: 'Ms Aishath Zimna Hussain', specialization: 'Audiologist and Speech-Language Pathologist', time: '08:00 - 16:00' },
      { name: 'Ms Mariyam Najla', specialization: 'Dietitian', time: '08:00 - 16:00' },
      { name: 'Dr. Mukesh Prasad Sah', specialization: 'Gastroenterologist', time: '08:00 - 16:00' },
      { name: 'Dr. Murari Prasad Barakoti', specialization: 'Senior Consultant Cardiology', time: '08:00 - 16:00' },
      { name: 'Dr. Nafha Abdulla', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Najahath Ahmed', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Nasheeda Saeed', specialization: 'Consultant Neurology', time: '08:00 - 16:00' },
      { name: 'Dr. Nuzha Mohamed', specialization: 'Senior Consultant Dermatology', time: '08:00 - 16:00' },
      { name: 'Dr. Piumi Dilhara Vithana Paletiyana Vithanage', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Prabhaw Upadhyaya', specialization: 'Consultant Internal Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Praveen Jeya Chidambara Pandian', specialization: 'Dentist Cum HOD', time: '08:00 - 16:00' },
      { name: 'Dr. Prem Raj Sigdel', specialization: 'Consultant Urology', time: '08:00 - 16:00' },
      { name: 'Dr. Quraisha Haneef', specialization: 'Consultant Internal Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Ram Prasad Pokhrel', specialization: 'Senior Consultant Pediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Ravi Kanodia', specialization: 'Consultant Oncology', time: '08:00 - 16:00' },
      { name: 'Dr. Robin Bhattarai', specialization: 'Consultant Neurosurgery', time: '08:00 - 16:00' },
      { name: 'Dr. Roshani Wagle', specialization: 'Consultant Dermatology', time: '08:00 - 16:00' },
      { name: 'Dr. Samyam Parajuli', specialization: 'Senior Consultant ENT', time: '08:00 - 16:00' },
      { name: 'Dr. Sariu Ali Didi', specialization: 'Consultant Rheumatology', time: '08:00 - 16:00' },
      { name: 'Dr. Sasi Seerappan', specialization: 'Senior Consultant Obstetrics & Gynaecology', time: '08:00 - 16:00' },
      { name: 'Dr. Shafraz Mohamed Shaheid', specialization: 'Consultant Orthopaedics', time: '08:00 - 16:00' },
      { name: 'Dr. Shaheela Mohamed Naseer', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Shahula Afeef', specialization: 'Senior Consultant Radiology', time: '08:00 - 16:00' },
      { name: 'Dr. Shanti Jaishi', specialization: 'Consultant Obstetrics & Gynaecology', time: '08:00 - 16:00' },
      { name: 'Dr. Shivir Sharma Dahal', specialization: 'Consultant Internal Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Soodh Antony', specialization: 'Senior Registrar Dentistry', time: '08:00 - 16:00' },
      { name: 'Dr. Srinivas Shetty Katpady', specialization: 'Senior Consultant Ophthalmology', time: '08:00 - 16:00' },
      { name: 'Dr. Suraj Dhaubhadel', specialization: 'Senior Consultant Pediatrics', time: '08:00 - 16:00' },
      { name: 'Dr. Syed Farhan Ali', specialization: 'Dentist', time: '08:00 - 16:00' },
      { name: 'Dr. Thulapitiyage Nishara Priyanji Weerasinghe', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Ubaidullah Hamoodh Rasheed', specialization: 'Medical Officer', time: '08:00 - 16:00' },
      { name: 'Dr. Vivek Kumar Rauniyar', specialization: 'Senior Consultant Neurology', time: '08:00 - 16:00' },
      { name: 'Dr. Wishama Abdul Razzag', specialization: 'Consultant Internal Medicine', time: '08:00 - 16:00' },
      { name: 'Dr. Yujan Sapkota', specialization: 'Senior Consultant Anesthesiology', time: '08:00 - 16:00' },
      { name: 'Dr. Zahiya Abdul Baree', specialization: 'Consultant Obstetrics & Gynaecology', time: '08:00 - 16:00' },
    ]
  },
  {
    id: '3',
    name: 'Medica Hospital',
    nameDv: 'މެޑިކާ ހޮސްޕިޓަލް',
    address: 'M. Dahana, Faamudheyri Magu, Male\', Maldives',
    addressDv: 'އެމް ދަހަނާ، ފާމުދެހެރީ މަގު، މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3002255',
    location: {
      lat: 4.1750,
      lng: 73.5080,
      googleMapsUrl: 'https://maps.google.com/?q=Medica+Hospital+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Nazmy Abdul Latheef', specialization: 'Consultant Sub-Specialist in Respiratory Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Binamra Gurung', specialization: 'Radiologist', time: '09:00 - 17:00' },
      { name: 'Dr. Ali Asim', specialization: 'Orthopaedician', time: '09:00 - 17:00' },
      { name: 'Dr. Ahmed Mohamed Ali', specialization: 'Consultant Obstetrician & Gynaecologist', time: '09:00 - 17:00' },
      { name: 'Dr. Sharmeen Aslam', specialization: 'Consultant in Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Rishikesh Sukumaran', specialization: 'Orthodontist', time: '09:00 - 17:00' },
      { name: 'Dr. Sumnima Mainali', specialization: 'Gynecologist and Obstetrician', time: '09:00 - 17:00' },
      { name: 'Dr. Subayyal Mushtaq Rather', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Devika Radhika Devanand', specialization: 'Pedodontist', time: '09:00 - 17:00' },
      { name: 'Dr. Nazla Musthafa', specialization: 'Pediatrician', time: '09:00 - 17:00' },
      { name: 'Dr. Zuhudha Hussain Manik', specialization: 'Radiologist', time: '09:00 - 17:00' },
      { name: 'Dr. Basma Ibrahim Sabir', specialization: 'Radiologist', time: '09:00 - 17:00' },
      { name: 'Dr. Rukshana Ahmed', specialization: 'Pediatrician', time: '09:00 - 17:00' },
      { name: 'Dr. Anton Priyantha Warnakulasuriya', specialization: 'Orthopedician', time: '09:00 - 17:00' },
      { name: 'Dr. Biju Balakrishna Pillai', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Sharahu Ahmed', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Aminath Zahra', specialization: 'Gynecologist and Obstetrician', time: '09:00 - 17:00' },
      { name: 'Dr. May Thinn Kyu', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Fathimath Mausooma', specialization: 'Dermatologist', time: '09:00 - 17:00' },
      { name: 'Dr. Prashanth Kumar Ginka', specialization: 'ENT Surgeon', time: '09:00 - 17:00' },
      { name: 'Dr. Mohammad Sarwar Eqbal', specialization: 'Urologist', time: '09:00 - 17:00' },
      { name: 'Dr. Ishag Shafeeg', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Qasim Bin Ali', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Rao Arqam Rehman', specialization: 'Anesthetist', time: '09:00 - 17:00' },
      { name: 'Mr. Ashok Kumar', specialization: 'Physiotherapist', time: '09:00 - 17:00' },
      { name: 'Ms. Mariyam Maas Habeeb', specialization: 'Dietitian', time: '09:00 - 17:00' },
      { name: 'Dr. De Nyein Lwin', specialization: 'Orthopedician', time: '09:00 - 17:00' },
      { name: 'Dr. Pooja K C', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Manoj Maruti Sanap', specialization: 'Plastic Surgeon', time: '09:00 - 17:00' },
      { name: 'Dr. Nashwa Hussain', specialization: 'Gynecologist and Obstetrician', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Shareef', specialization: 'General Surgeon', time: '09:00 - 17:00' },
      { name: 'Dr. Fathimath Nadiya', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Nishan Nepal', specialization: 'Pediatrician', time: '09:00 - 17:00' },
      { name: 'Dr. Abdul Azeez Ahmed', specialization: 'Cardiology', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Solih', specialization: 'General Surgeon', time: '09:00 - 17:00' },
      { name: 'Dr. Aminath Shaheeda', specialization: 'Gynecologist and Obstetrician', time: '09:00 - 17:00' },
      { name: 'Dr. Jumailath Beygum', specialization: 'Gynecologist and Obstetrician', time: '09:00 - 17:00' },
      { name: 'Dr. Kaushal Kishore Tiwari', specialization: 'Cardiothoracic and Vascular Surgeon', time: '09:00 - 17:00' },
      { name: 'Dr. Malaka Shafiu', specialization: 'Gynecologist and Obstetrician', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Munshid', specialization: 'Orthopedician', time: '09:00 - 17:00' },
      { name: 'Dr. Shah Abdullah Mahir', specialization: 'Orthopedician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '4',
    name: 'Tree Top Hospital',
    nameDv: 'ޓްރީ ޓޮޕް ހޮސްޕިޓަލް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3351610',
    location: {
      lat: 4.1780,
      lng: 73.5120,
      googleMapsUrl: 'https://maps.google.com/?q=Tree+Top+Hospital+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Aminath Fiuna', specialization: 'Anesthesiology', time: '09:00 - 17:00' },
      { name: 'Dr. Sama Haleem', specialization: 'Anesthesiology', time: '09:00 - 17:00' },
      { name: 'Dr. Zulaikha Maee', specialization: 'Anesthesiology', time: '09:00 - 17:00' },
      { name: 'Dr. Ahmad Ibrahim Ibrahim Mansour', specialization: 'Anesthesiology', time: '09:00 - 17:00' },
      { name: 'Dr. Lenka Cervenova', specialization: 'Anesthesiology', time: '09:00 - 17:00' },
      { name: 'Dr. Sadhima Rasheed', specialization: 'Anesthesiology', time: '09:00 - 17:00' },
      { name: 'Dr. Nisha Shrestha', specialization: 'Anesthesiology', time: '09:00 - 17:00' },
      { name: 'Dr. Aminath Asma', specialization: 'Anesthesiology', time: '09:00 - 17:00' },
      { name: 'Dr. Ismail Latheef', specialization: 'Anesthesiology', time: '09:00 - 17:00' },
      { name: 'Dr. Abdul Azeez Ahmed', specialization: 'Cardiology', time: '09:00 - 17:00' },
      { name: 'Dr. Amit Agarwal', specialization: 'Cardiology', time: '09:00 - 17:00' },
      { name: 'Dr. Moosa Manik Ibrahim', specialization: 'Cardiology', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Shaneez', specialization: 'Cardiology', time: '09:00 - 17:00' },
      { name: 'Dr. Anish Hirachan', specialization: 'Cardiology', time: '09:00 - 17:00' },
      { name: 'Dr. Naifa Afeef', specialization: 'Dental Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Aman Ullah Siddiqi', specialization: 'Dental Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Mohammed Salman', specialization: 'Dental Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Aminath Reesha', specialization: 'Dental Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Asim Ghouse Basha', specialization: 'Dental Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Shabina Aysha Begum', specialization: 'Dental Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Farzeen Nasir', specialization: 'Dermatology', time: '09:00 - 17:00' },
      { name: 'Dr. Anu Agrawal', specialization: 'Dermatology', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Haikal', specialization: 'Dermatology', time: '09:00 - 17:00' },
      { name: 'Dr. Hana Salih', specialization: 'Dermatology', time: '09:00 - 17:00' },
      { name: 'Dr. Sarfaraz Ahmed Khatri', specialization: 'Emergency Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Ali Shareef', specialization: 'Emergency Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Shruti Kriti', specialization: 'Emergency Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Ajay Chaudhary', specialization: 'Emergency Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Joseph E. Ojobi', specialization: 'Endocrinology', time: '09:00 - 17:00' },
      { name: 'Dr. Ibrahim Iyaz', specialization: 'Family Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Amitesh Raj Pandey', specialization: 'Family Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Fiaz Jillani', specialization: 'Family Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Sunil Kumar Marik', specialization: 'Gastroenterology', time: '09:00 - 17:00' },
      { name: 'Dr. Abdulla Ubaid', specialization: 'General Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Neeza Haleem', specialization: 'General Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Aishath Azna', specialization: 'General Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Shareef', specialization: 'General Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Althaf Adnan Ismail', specialization: 'General Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Ibrahim Moomin', specialization: 'General Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Uktam Abdullaev', specialization: 'General Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Maumoon Asim', specialization: 'General Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Huseyn Hadiyev', specialization: 'General Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Emre Karakoc', specialization: 'Intensive Care Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Nisha Shrestha', specialization: 'Intensive Care Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Rajib Dey', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Faisham', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Mahmoud Abbas', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Emre Karakoc', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Muhammad Asad Ur', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Amith Narayana Pillai', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Paresh Hansraj Bharia', specialization: 'Laboratory Medicine and Pathology', time: '09:00 - 17:00' },
      { name: 'Dr. Balaji Birajdar', specialization: 'Microbiology', time: '09:00 - 17:00' },
      { name: 'Dr. Sarfaraz Rafeeq Ahmed', specialization: 'Neonatology', time: '09:00 - 17:00' },
      { name: 'Dr. Ingrid Mornarova', specialization: 'Neonatology', time: '09:00 - 17:00' },
      { name: 'Dr. Bipin Karki', specialization: 'Neonatology', time: '09:00 - 17:00' },
      { name: 'Dr. Jaya Nath', specialization: 'Nephrology', time: '09:00 - 17:00' },
      { name: 'Dr. Ahmed Abdulla', specialization: 'Nephrology', time: '09:00 - 17:00' },
      { name: 'Dr. Sreejesh Balakrishnan', specialization: 'Nephrology', time: '09:00 - 17:00' },
      { name: 'Dr. Anish Lawrence', specialization: 'Neurology', time: '09:00 - 17:00' },
      { name: 'Dr. Jamshid Islomov', specialization: 'Neurosurgery', time: '09:00 - 17:00' },
      { name: 'Dr. Ali Niyaf', specialization: 'Neurosurgery', time: '09:00 - 17:00' },
      { name: 'Dr. Ali Aafee', specialization: 'Neurosurgery', time: '09:00 - 17:00' },
      { name: 'Dr. Anish Man Singh', specialization: 'Neurosurgery', time: '09:00 - 17:00' },
      { name: 'Dr. Maria Cristina', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Varsha Rengaraj', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Aminath Shaheeda', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Aishath Shibana', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Zakiya Ahmed', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Thasneem Faroog', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Shirmeen Mohamed', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Preethy Solomon', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Aseel Jaleel', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Inaya Abdul Raheem', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Aminath Nusra', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Juhaina Hameed', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Natasa Nikolic', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Sajana Shrestha', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Munuswamy Narayanan', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Aditi Kulkarni', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Anita Gour', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Farzana Sohail', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Benju Nepal', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Hawwa Hana', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Jabeen Ali Shareef', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Sonali Chandrashekhar', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Amru Ahmed', specialization: 'Oncology', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Shifan', specialization: 'Oncology', time: '09:00 - 17:00' },
      { name: 'Dr. Aditya Rege', specialization: 'Ophthalmology', time: '09:00 - 17:00' },
      { name: 'Dr. Saranya Vijayan', specialization: 'Ophthalmology', time: '09:00 - 17:00' },
      { name: 'Dr. Parag Apte', specialization: 'Ophthalmology', time: '09:00 - 17:00' },
      { name: 'Dr. Archana Sharma', specialization: 'Ophthalmology', time: '09:00 - 17:00' },
      { name: 'Dr. Mohammed Salman', specialization: 'Oral and Maxillofacial Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Haabeeb', specialization: 'Orthopedics, Trauma Surgery and Sports Injuries', time: '09:00 - 17:00' },
      { name: 'Dr. Kanniraj Marimuthu', specialization: 'Orthopedics, Trauma Surgery and Sports Injuries', time: '09:00 - 17:00' },
      { name: 'Dr. Hussain Faisal', specialization: 'Orthopedics, Trauma Surgery and Sports Injuries', time: '09:00 - 17:00' },
      { name: 'Dr. Ali Muznee', specialization: 'Orthopedics, Trauma Surgery and Sports Injuries', time: '09:00 - 17:00' },
      { name: 'Dr. Mariyam Yoomy', specialization: 'Orthopedics, Trauma Surgery and Sports Injuries', time: '09:00 - 17:00' },
      { name: 'Dr. Atul Bhaskar', specialization: 'Orthopedics, Trauma Surgery and Sports Injuries', time: '09:00 - 17:00' },
      { name: 'Dr. Ahmed Azim Abdul', specialization: 'Orthopedics, Trauma Surgery and Sports Injuries', time: '09:00 - 17:00' },
      { name: 'Dr. Roshan Yadav', specialization: 'Orthopedics, Trauma Surgery and Sports Injuries', time: '09:00 - 17:00' },
      { name: 'Dr. Rakesh Kumar Yadav', specialization: 'Orthopedics, Trauma Surgery and Sports Injuries', time: '09:00 - 17:00' },
      { name: 'Dr. Subhash Kumar Das', specialization: 'Orthopedics, Trauma Surgery and Sports Injuries', time: '09:00 - 17:00' },
      { name: 'Dr. Chandrashekhar Rawal', specialization: 'Otorhinolaryngology (ENT)', time: '09:00 - 17:00' },
      { name: 'Dr. Seema Ramlakhan Gupta', specialization: 'Otorhinolaryngology (ENT)', time: '09:00 - 17:00' },
      { name: 'Dr. Rajesh A. Valand', specialization: 'Otorhinolaryngology (ENT)', time: '09:00 - 17:00' },
      { name: 'Dr. Hussain Nazif', specialization: 'Otorhinolaryngology (ENT)', time: '09:00 - 17:00' },
      { name: 'Dr. Alessandra Martino', specialization: 'Paediatrics', time: '09:00 - 17:00' },
      { name: 'Dr. Zumra Latheef', specialization: 'Paediatrics', time: '09:00 - 17:00' },
      { name: 'Dr. Rukhsana Ahmed', specialization: 'Paediatrics', time: '09:00 - 17:00' },
      { name: 'Dr. Subin Manandhar', specialization: 'Paediatrics', time: '09:00 - 17:00' },
      { name: 'Dr. Farha Naaz', specialization: 'Paediatrics', time: '09:00 - 17:00' },
      { name: 'Dr. Rajib Yadav', specialization: 'Paediatrics', time: '09:00 - 17:00' },
      { name: 'Dr. Arun Bajgain', specialization: 'Paediatrics', time: '09:00 - 17:00' },
      { name: 'Dr. Shajee Puthiya Purayil', specialization: 'Psychiatry', time: '09:00 - 17:00' },
      { name: 'Ms. Saudath Afeef', specialization: 'Psychology', time: '09:00 - 17:00' },
      { name: 'Dr. Aishath Naurin', specialization: 'Radiology', time: '09:00 - 17:00' },
      { name: 'Dr. Nazahath Abbas', specialization: 'Radiology', time: '09:00 - 17:00' },
      { name: 'Dr. Kanchan Adhikari', specialization: 'Radiology', time: '09:00 - 17:00' },
      { name: 'Dr. Tayyaba Kauser', specialization: 'Radiology', time: '09:00 - 17:00' },
      { name: 'Dr. Kosana Manikanta', specialization: 'Radiology', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '5',
    name: 'AMDC - Azmi-Naeem Medical & Diagnostic Centre',
    nameDv: 'އޭއެމްޑީސީ - އަޒްމީ-ނައީމް މެޑިކަލް އެންޑް ޑައިއެގްނޮސްޓިކް ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3323232',
    location: {
      lat: 4.1765,
      lng: 73.5095,
      googleMapsUrl: 'https://maps.google.com/?q=AMDC+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Zahida Hassan Manik', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Yusra Ali', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Teena Eliz John', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Seshadri Das', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Rukhsana Ahmed', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Rugiyya Mohamed Saeed', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Ravi Shankar', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Raghavendra Nair', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Prashanth Kumar Ginka', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Naina Bhatti', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Muthasim Saeed', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Mohammad Sarwar Eqbal', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Mohamed Wahid', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Mohamed Ali', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Meetha Jolly', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Maria Krugova', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Khadeeja Abdulla', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Kalimuthu', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Jejo Mathew', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Ismail Zahir', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Ibrahim Sujau', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Hussain Faisal', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Hemanth Suresh', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. George Thomas', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Dhanya Sreekumaran', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Basma Ibrahim', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Ashoka Rao', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Anton P. Warnakulasuriya', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Aminath Zahra', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Aminath Shaheedha', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Aishath Reema', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Adam Ali', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Abdulla Junaid', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Abdul Azeez Yoosuf', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Abdul Azeez Hameed', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Shailendra Karki', specialization: 'General Physician', time: '08:30 - 22:30' },
      { name: 'Dr. Ghanem', specialization: 'General Physician', time: '08:30 - 22:30' },
    ]
  },
  {
    id: '6',
    name: 'Medica Maldives',
    nameDv: 'މެޑިކާ މޯލްޑިވްސް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3344400',
    location: {
      lat: 4.1745,
      lng: 73.5075,
      googleMapsUrl: 'https://maps.google.com/?q=Medica+Maldives+Male'
    },
    doctors: [
      { name: 'Dr. Nazmy Abdul Latheef', specialization: 'Respiratory Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Binamra Gurung', specialization: 'Radiologist', time: '09:00 - 17:00' },
      { name: 'Dr. Ali Asim', specialization: 'Orthopaedician', time: '09:00 - 17:00' },
      { name: 'Dr. Ahmed Mohamed Ali', specialization: 'Obstetrician & Gynaecologist', time: '09:00 - 17:00' },
      { name: 'Dr. Sharmeen Aslam', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Rishikesh Sukumaran', specialization: 'Orthodontist', time: '09:00 - 17:00' },
      { name: 'Dr. Sumnima Mainali', specialization: 'Gynecologist', time: '09:00 - 17:00' },
      { name: 'Dr. Subayyal Mushtaq Rather', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Devika Radhika Devanand', specialization: 'Pedodontist', time: '09:00 - 17:00' },
      { name: 'Dr. Nazla Musthafa', specialization: 'Pediatrician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '7',
    name: 'Sonee Medical',
    nameDv: 'ސޫނީ މެޑިކަލް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3334567',
    location: {
      lat: 4.1730,
      lng: 73.5060,
      googleMapsUrl: 'https://maps.google.com/?q=Sonee+Medical+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Ahmed Nazeer', specialization: 'General Physician', time: '10:00 - 18:00' },
      { name: 'Dr. Aminath Mohamed', specialization: 'Dermatologist', time: '18:00 - 22:00' },
    ]
  },
  {
    id: '8',
    name: 'Male\' Health Center',
    nameDv: 'މާލެ ހެލްތް ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3326789',
    location: {
      lat: 4.1765,
      lng: 73.5085,
      googleMapsUrl: 'https://maps.google.com/?q=Male+Health+Center+Maldives'
    },
    doctors: [
      { name: 'Dr. Mohamed Saeed', specialization: 'General Physician', time: '08:00 - 16:00' },
      { name: 'Dr. Mariyam Shifa', specialization: 'General Physician', time: '16:00 - 22:00' },
    ]
  },
  {
    id: '9',
    name: 'Clinica Maldives - Male Center',
    nameDv: 'ކްލިނިކާ މޯލްޑިވްސް - މާލެ ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3334554',
    location: {
      lat: 4.1775,
      lng: 73.5110,
      googleMapsUrl: 'https://maps.google.com/?q=Clinica+Maldives+Male'
    },
    doctors: [
      { name: 'Dr. Pradeep Fernando', specialization: 'Medical Director', time: '09:00 - 17:00' },
      { name: 'Dr. Samitha Srijith', specialization: 'Clinical Lead', time: '09:00 - 17:00' },
      { name: 'Dr. Nashwa Ahmed', specialization: 'Dermatologist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '10',
    name: 'SurgiCare Medical Center',
    nameDv: 'ސާޖިކޭއަރ މެޑިކަލް ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3315354',
    location: {
      lat: 4.1768,
      lng: 73.5090,
      googleMapsUrl: 'https://maps.google.com/?q=SurgiCare+Medical+Center+Male'
    },
    doctors: [
      { name: 'Dr. Abdulla Ubaid', specialization: 'General Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Aishath Azna Ali', specialization: 'Surgical Gastroenterology', time: '09:00 - 17:00' },
      { name: 'Dr. Rizana Abdulla', specialization: 'Obstetrics and Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Mariyam Muzna Mohamed', specialization: 'Radiology', time: '09:00 - 17:00' },
      { name: 'Dr. Aishath Naura', specialization: 'Radiology', time: '09:00 - 17:00' },
    ]
  },
  // Hulhumale' Clinics
  {
    id: '11',
    name: 'Clinica Maldives - Hulhumale Center',
    nameDv: 'ކްލިނިކާ މޯލްޑިވްސް - ހުޅުމާލޭ ސެންޓަރ',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 3334554',
    location: {
      lat: 4.2190,
      lng: 73.5390,
      googleMapsUrl: 'https://maps.google.com/?q=Clinica+Maldives+Hulhumale'
    },
    doctors: [
      { name: 'Dr. Pradeep Fernando', specialization: 'Medical Director', time: '09:00 - 17:00' },
      { name: 'Dr. Samitha Srijith', specialization: 'Clinical Lead', time: '09:00 - 17:00' },
      { name: 'Dr. Nashwa Ahmed', specialization: 'Dermatologist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '12',
    name: 'EyeCare Hospital Hulhumale Annex',
    nameDv: 'އައި ކޭއަރ ހޮސްޕިޓަލް ހުޅުމާލޭ އެނެކްސް',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 3321026',
    location: {
      lat: 4.2195,
      lng: 73.5395,
      googleMapsUrl: 'https://maps.google.com/?q=EyeCare+Hospital+Hulhumale'
    },
    doctors: [
      { name: 'Dr. Almas Adnan Ismail', specialization: 'Consultant Ophthalmologist', time: '08:30 - 23:00' },
      { name: 'Dr. Sofiya Makajoo', specialization: 'Consultant Ophthalmologist', time: '08:30 - 23:00' },
      { name: 'Dr. Fahad Hossen', specialization: 'Consultant Ophthalmologist', time: '08:30 - 23:00' },
      { name: 'Dr. Pooja Karki', specialization: 'Consultant Ophthalmologist', time: '08:30 - 23:00' },
      { name: 'Dr. Khondker Liaquat Ali', specialization: 'Consultant Ophthalmologist', time: '08:30 - 23:00' },
      { name: 'Dr. Nafeesa Abdul Latheef', specialization: 'Consultant Ophthalmologist', time: '08:30 - 23:00' },
    ]
  },
  {
    id: '13',
    name: 'Eve Clinic Hulhumale',
    nameDv: 'އިވް ކްލިނިކް ހުޅުމާލޭ',
    address: 'Hulhumale\' Phase II, Maldives',
    addressDv: 'ހުޅުމާލޭ ފޭސް ޓޫ، ދިވެހިރާއްޖެ',
    phone: '+960 7406788',
    location: {
      lat: 4.2180,
      lng: 73.5380,
      googleMapsUrl: 'https://maps.google.com/?q=Eve+Clinic+Hulhumale'
    },
    doctors: [
      { name: 'Dr. Mohamed Musthafa Farooq', specialization: 'Psychotherapist', time: '09:00 - 17:00' },
      { name: 'Dr. Nisha KC', specialization: 'Dermatologist', time: '09:00 - 17:00' },
      { name: 'Dr. Ibrahim Jaufar', specialization: 'Managing Director', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '14',
    name: 'Life Care Medical Centre - Dental',
    nameDv: 'ލައިފް ކޭއަރ މެޑިކަލް ސެންޓަރ - ޑެންޓަލް',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 3343333',
    location: {
      lat: 4.2200,
      lng: 73.5400,
      googleMapsUrl: 'https://maps.google.com/?q=Life+Care+Medical+Centre+Hulhumale'
    },
    doctors: [
      { name: 'Dr. Visiting Dentist', specialization: 'Dentist', time: '09:00 - 17:00' },
      { name: 'Dr. Visiting Dentist', specialization: 'Dentist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '15',
    name: 'EyeCare Maldives',
    nameDv: 'އައި ކޭއަރ މޯލްޑިވްސް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3332020',
    location: {
      lat: 4.1770,
      lng: 73.5100,
      googleMapsUrl: 'https://maps.google.com/?q=EyeCare+Maldives+Male'
    },
    doctors: [
      { name: 'Dr. Mohamed Azzam', specialization: 'Ophthalmologist (Retina)', time: '09:00 - 17:00' },
      { name: 'Dr. Amogh Dileep Asgaonkar', specialization: 'Vitreoretinal Surgeon', time: '09:00 - 17:00' },
      { name: 'Dr. Arjun Malla Bhari', specialization: 'Pediatric Ophthalmology', time: '09:00 - 17:00' },
      { name: 'Dr. Almas Adnan Ismail', specialization: 'Glaucoma Specialist', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Adib Uddin', specialization: 'General Ophthalmology', time: '09:00 - 17:00' },
      { name: 'Dr. Fahad Hossen', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Pooja Karki', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Vijayamani Janampalli', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Khondker Liaquat Ali', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Kausik Kumar Deb', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Sofiya Makajoo', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Mariyam Shahana Mufeed', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Nafeesa Abdul Latheef', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Mandhoof Moosa', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Fathimath Shaamaly Jaufar', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '16',
    name: 'TTH Clinic Male',
    nameDv: 'ޓީޓީއެޗް ކްލިނިކް މާލެ',
    address: 'Buruzu Magu, Male\', Maldives',
    addressDv: 'ބުރުޒު މަގު، މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3351610',
    location: {
      lat: 4.1770,
      lng: 73.5085,
      googleMapsUrl: 'https://maps.google.com/?q=TTH+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Fiaz Jillani', specialization: 'Family Medicine', time: '08:00 - 17:00' },
      { name: 'Dr. Mahmoud Abbas', specialization: 'Internal Medicine', time: '08:00 - 17:00' },
      { name: 'Dr. Amith Narayana Pillai', specialization: 'Internal Medicine', time: '08:00 - 17:00' },
      { name: 'Dr. Muhammad Asad Ur Rehman Khan', specialization: 'Internal Medicine', time: '08:00 - 17:00' },
      { name: 'Dr. Pankaj Patawari', specialization: 'Endocrinologist', time: '20:30 - 22:30' },
    ]
  },
  {
    id: '17',
    name: 'Pearl Medical Centre',
    nameDv: 'ޕާރލް މެޑިކަލް ސެންޓަރ',
    address: 'Shaariuvarudhee Magu, Male\', Maldives',
    addressDv: 'ޝާރިއުވަރުދީ މަގު، މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3305550',
    location: {
      lat: 4.1760,
      lng: 73.5075,
      googleMapsUrl: 'https://maps.google.com/?q=Pearl+Medical+Centre+Male'
    },
    doctors: [
      { name: 'Dr. Ramachandran S', specialization: 'General Physician', time: '09:00 - 17:00' },
      { name: 'Dr. Abu Bakkar Ghauri', specialization: 'General Physician', time: '09:00 - 17:00' },
      { name: 'Dr. Ashly Franklin', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Rohith Balachandran', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Ibrahim Shuja', specialization: 'General Physician', time: '09:00 - 17:00' },
      { name: 'Dr. Mariyam Niyaz', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '18',
    name: 'Elite Medical Centre',
    nameDv: 'އިލައިޓް މެޑިކަލް ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3333505',
    location: {
      lat: 4.1750,
      lng: 73.5065,
      googleMapsUrl: 'https://maps.google.com/?q=Elite+Medical+Centre+Male'
    },
    doctors: [
      { name: 'Dr. May Thin Khine', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Fathmath Rifga', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Ali', specialization: 'General Practice & Orthopedics', time: '09:00 - 17:00' },
      { name: 'Dr. Khadiza Majumder Zeenat', specialization: 'Doctor', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '19',
    name: 'Maldicare Clinic',
    nameDv: 'މޯލްޑިކޭއަރ ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3331590',
    location: {
      lat: 4.1740,
      lng: 73.5060,
      googleMapsUrl: 'https://maps.google.com/?q=Maldicare+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Yahiya Zachariah', specialization: 'Dentist', time: '09:00 - 17:00' },
      { name: 'Dr. Shafayet Hossain', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Ishag Shafeeg', specialization: 'Medical Director', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '20',
    name: 'Mednova Medical Center',
    nameDv: 'މެޑްނޮވާ މެޑިކަލް ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3312244',
    location: {
      lat: 4.1735,
      lng: 73.5055,
      googleMapsUrl: 'https://maps.google.com/?q=Mednova+Medical+Center+Male'
    },
    doctors: [
      { name: 'Dr. Asif Shamsudeen', specialization: 'Dental Surgeon', time: '09:00 - 17:00' },
      { name: 'Dr. Omneya El Zagh', specialization: 'Dermatologist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '21',
    name: 'Vital Care',
    nameDv: 'ވައިޓަލް ކޭއަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7774517',
    location: {
      lat: 4.1730,
      lng: 73.5050,
      googleMapsUrl: 'https://maps.google.com/?q=Vital+Care+Male'
    },
    doctors: [
      { name: 'Dr. Mohamed Muthuim', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Syed Inayathullah Hussaini', specialization: 'Dentist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '22',
    name: 'Eve Clinic Male',
    nameDv: 'އިވް ކްލިނިކް މާލެ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3300788',
    location: {
      lat: 4.1725,
      lng: 73.5045,
      googleMapsUrl: 'https://maps.google.com/?q=Eve+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Mohamed Musthafa Farooq', specialization: 'Psychotherapist', time: '09:00 - 17:00' },
      { name: 'Dr. Nisha KC', specialization: 'Dermatologist', time: '09:00 - 17:00' },
      { name: 'Dr. Ibrahim Jaufar', specialization: 'Managing Director', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '23',
    name: 'Central Medical Center',
    nameDv: 'ސެންޓްރަލް މެޑިކަލް ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7511844',
    location: {
      lat: 4.1720,
      lng: 73.5040,
      googleMapsUrl: 'https://maps.google.com/?q=Central+Medical+Center+Male'
    },
    doctors: [
      { name: 'Dr. Min Maung Maung', specialization: 'Orthopedics', time: '09:00 - 17:00' },
      { name: 'Dr. Ismail Zahir', specialization: 'Orthopedics', time: '09:00 - 17:00' },
      { name: 'Dr. Nasheed', specialization: 'Orthopedics', time: '09:00 - 17:00' },
      { name: 'Dr. Munshid', specialization: 'Orthopedics', time: '09:00 - 17:00' },
      { name: 'Dr. Zahidha', specialization: 'Gynaecology', time: '09:00 - 17:00' },
      { name: 'Dr. Meeta Jolly', specialization: 'Gynaecology', time: '09:00 - 17:00' },
      { name: 'Dr. Naina Bhatti', specialization: 'Gynaecology', time: '09:00 - 17:00' },
      { name: 'Dr. Alla Shakir', specialization: 'Neurology', time: '09:00 - 17:00' },
      { name: 'Dr. Haneef', specialization: 'Cardiology', time: '09:00 - 17:00' },
      { name: 'Dr. Veer Rao', specialization: 'E.N.T', time: '09:00 - 17:00' },
      { name: 'Dr. Jacob Jose', specialization: 'E.N.T', time: '09:00 - 17:00' },
      { name: 'Dr. Naresh Nagpal', specialization: 'E.N.T', time: '09:00 - 17:00' },
      { name: 'Dr. Ranjit Jose', specialization: 'E.N.T', time: '09:00 - 17:00' },
      { name: 'Dr. Adam Ali', specialization: 'Internal', time: '09:00 - 17:00' },
      { name: 'Dr. Biju Pillai', specialization: 'Internal', time: '09:00 - 17:00' },
      { name: 'Dr. Moosa Murad', specialization: 'Internal', time: '09:00 - 17:00' },
      { name: 'Dr. Shine', specialization: 'Dentistry', time: '09:00 - 17:00' },
      { name: 'Dr. B.B Jolly', specialization: 'Urology', time: '09:00 - 17:00' },
      { name: 'Dr. Aishath Reema', specialization: 'Dermatology', time: '09:00 - 17:00' },
      { name: 'Dr. Shereef Hussain', specialization: 'Dermatology', time: '09:00 - 17:00' },
      { name: 'Dr. Thakur', specialization: 'Radiology', time: '09:00 - 17:00' },
      { name: 'Dr. Leh Leh Khaing', specialization: 'Radiology', time: '09:00 - 17:00' },
      { name: 'Dr. Ghanem', specialization: 'Respiratory', time: '09:00 - 17:00' },
      { name: 'Dr. Vijayarani', specialization: 'General', time: '09:00 - 17:00' },
      { name: 'Dr. Mihunath', specialization: 'Paediatrics', time: '09:00 - 17:00' },
      { name: 'Ms. Shahudha', specialization: 'Counseling', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '24',
    name: 'Central Clinic',
    nameDv: 'ސެންޓްރަލް ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7511845',
    location: {
      lat: 4.1715,
      lng: 73.5035,
      googleMapsUrl: 'https://maps.google.com/?q=Central+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Shereef Hussain', specialization: 'Dermatologist', time: '09:00 - 17:00' },
      { name: 'Dr. Hamid Rasheed', specialization: 'Surgeon', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '25',
    name: 'Advance Medical Clinic',
    nameDv: 'އެޑްވާންސް މެޑިކަލް ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3007788',
    location: {
      lat: 4.1710,
      lng: 73.5030,
      googleMapsUrl: 'https://maps.google.com/?q=Advance+Medical+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Shazma Abdulla', specialization: 'Obstetrician and Gynecologist', time: '09:00 - 17:00' },
      { name: 'Dr. Abdulla Afeef', specialization: 'Pediatrician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '26',
    name: 'Imperial Medicare Centre',
    nameDv: 'އިމްޕީރިއަލް މެޑިކޭއަރ ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3316600',
    location: {
      lat: 4.1705,
      lng: 73.5025,
      googleMapsUrl: 'https://maps.google.com/?q=Imperial+Medicare+Centre+Male'
    },
    doctors: [
      { name: 'Dr. Hameed Ahmed Manik', specialization: 'Senior Consultant', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '27',
    name: 'CyMa Care',
    nameDv: 'ސައިއެމް ކޭއަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7901920',
    location: {
      lat: 4.1700,
      lng: 73.5020,
      googleMapsUrl: 'https://maps.google.com/?q=CyMa+Care+Male'
    },
    doctors: [
      { name: 'Dr. Fathimath Ashan', specialization: 'Psychologist', time: '09:00 - 17:00' },
      { name: 'Dr. Ragini Sharma', specialization: 'Occupational Therapist', time: '09:00 - 17:00' },
      { name: 'Dr. Samreen Sami', specialization: 'Occupational Therapist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '28',
    name: 'My Clinic',
    nameDv: 'މައި ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7776313',
    location: {
      lat: 4.1695,
      lng: 73.5015,
      googleMapsUrl: 'https://maps.google.com/?q=My+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Biju', specialization: 'Dentist', time: '09:00 - 17:00' },
      { name: 'Dr. Sachin', specialization: 'Orthodontist', time: '09:00 - 17:00' },
      { name: 'Dr. Nazmy Abdul Latheef', specialization: 'Pulmonologist', time: '09:00 - 17:00' },
      { name: 'Dr. Ibrahim Misbah', specialization: 'Urologist', time: '09:00 - 17:00' },
      { name: 'Dr. Alla Shakir', specialization: 'Neurologist', time: '09:00 - 17:00' },
      { name: 'Dr. Ali Nazeem', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '29',
    name: 'Faruvaa Clinic',
    nameDv: 'ފަރުވާ ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3330535',
    location: {
      lat: 4.1690,
      lng: 73.5010,
      googleMapsUrl: 'https://maps.google.com/?q=Faruvaa+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Saraa Yoosuf', specialization: 'Senior Medical Officer', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '30',
    name: 'Listen Clinic',
    nameDv: 'ލިސެން ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3300078',
    location: {
      lat: 4.1685,
      lng: 73.5005,
      googleMapsUrl: 'https://maps.google.com/?q=Listen+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Visiting ENT Specialist', specialization: 'ENT Doctor', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '31',
    name: 'Medhope Medical Centre',
    nameDv: 'މެޑްހޯޕް މެޑިކަލް ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3334966',
    location: {
      lat: 4.1680,
      lng: 73.5000,
      googleMapsUrl: 'https://maps.google.com/?q=Medhope+Medical+Centre+Male'
    },
    doctors: [
      { name: 'Dr. Fazeel Ahmed', specialization: 'Maxillofacial Surgeon', time: '09:00 - 17:00' },
      { name: 'Dr. Rachel Susan John', specialization: 'Dental Surgeon', time: '09:00 - 17:00' },
      { name: 'Dr. Sreenath', specialization: 'Orthodontist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '32',
    name: 'Asisa Medical Center',
    nameDv: 'އަސިސާ މެޑިކަލް ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3013900',
    location: {
      lat: 4.1675,
      lng: 73.4995,
      googleMapsUrl: 'https://maps.google.com/?q=Asisa+Medical+Center+Male'
    },
    doctors: [
      { name: 'Dr. Visiting Dermatologist', specialization: 'Dermatologist', time: '08:30 - 22:00' },
    ]
  },
  {
    id: '33',
    name: 'Kulunu Medical Clinic',
    nameDv: 'ކުލުނު މެޑިކަލް ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 4003311',
    location: {
      lat: 4.1670,
      lng: 73.4990,
      googleMapsUrl: 'https://maps.google.com/?q=Kulunu+Medical+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Salman Nizam', specialization: 'Neurology', time: '09:00 - 23:30' },
    ]
  },
  {
    id: '34',
    name: 'Centre for Traditional Medicine',
    nameDv: 'ޓްރެޑިޝަނަލް މެޑިސިން ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3320105',
    location: {
      lat: 4.1665,
      lng: 73.4985,
      googleMapsUrl: 'https://maps.google.com/?q=Centre+for+Traditional+Medicine+Male'
    },
    doctors: [
      { name: 'Dr. Yusriyya Salih', specialization: 'Ayurvedic Physician', time: '09:00 - 17:00' },
      { name: 'Dr. Jubil P Anil', specialization: 'Ayurvedic Doctor', time: '09:00 - 17:00' },
      { name: 'Dr. Shilpa K S', specialization: 'Ayurvedic Consultant', time: '09:00 - 17:00' },
    ]
  },
  // Hulhumale' Clinics
  {
    id: '35',
    name: 'Pearl Medical Centre Hulhumale',
    nameDv: 'ޕާރލް މެޑިކަލް ސެންޓަރ ހުޅުމާލޭ',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 3355001',
    location: {
      lat: 4.2190,
      lng: 73.5390,
      googleMapsUrl: 'https://maps.google.com/?q=Pearl+Medical+Centre+Hulhumale'
    },
    doctors: [
      { name: 'Dr. Ramachandran S', specialization: 'General Physician', time: '09:00 - 17:00' },
      { name: 'Dr. Abu Bakkar Ghauri', specialization: 'General Physician', time: '09:00 - 17:00' },
      { name: 'Dr. Ashly Franklin', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Rohith Balachandran', specialization: 'Medical Officer', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '36',
    name: 'Care Trust Multispeciality Clinic',
    nameDv: 'ކޭއަރ ޓްރަސްޓް މަލްޓިސްޕެޝަލިޓީ ކްލިނިކް',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 3350000',
    location: {
      lat: 4.2185,
      lng: 73.5385,
      googleMapsUrl: 'https://maps.google.com/?q=Care+Trust+Multispeciality+Clinic+Hulhumale'
    },
    doctors: [
      { name: 'Dr. Neeza Haleem', specialization: 'General Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Hussain Nazif', specialization: 'ENT', time: '09:00 - 17:00' },
      { name: 'Dr. Yusra Ali', specialization: 'Radiology', time: '09:00 - 17:00' },
      { name: 'Dr. Paras Kumar Rajbhandari', specialization: 'Radiology', time: '09:00 - 17:00' },
      { name: 'Dr. Aishath Eleena', specialization: 'Paediatric Cardiologist', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Razzan Rameez', specialization: 'Orthopedics', time: '09:00 - 17:00' },
      { name: 'Dr. Abdulla Afeef', specialization: 'Pediatrician', time: '09:00 - 17:00' },
      { name: 'Dr. Hana Salih', specialization: 'Dermatologist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '37',
    name: 'Synergy Care',
    nameDv: 'ސިނަރޖީ ކޭއަރ',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 3351111',
    location: {
      lat: 4.2180,
      lng: 73.5380,
      googleMapsUrl: 'https://maps.google.com/?q=Synergy+Care+Hulhumale'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '39',
    name: 'Hulhumale Hospital',
    nameDv: 'ހުޅުމާލޭ ހޮސްޕިޓަލް',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 3355555',
    location: {
      lat: 4.2175,
      lng: 73.5375,
      googleMapsUrl: 'https://maps.google.com/?q=Hulhumale+Hospital'
    },
    doctors: [
      { name: 'Dr. Amitesh Raj Pandey', specialization: 'Medical Doctor', time: '09:00 - 17:00' },
      { name: 'Dr. Bayezid Khan', specialization: 'Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Nuhadh Nashid', specialization: 'Medical Doctor', time: '09:00 - 17:00' },
      { name: 'Dr. Andrew Louis', specialization: 'Anesthesia Consultant', time: '09:00 - 17:00' },
      { name: 'Dr. Aishath Ana Hifaz', specialization: 'Medical Officer', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '40',
    name: 'Eve Clinic Hulhumale',
    nameDv: 'އިވް ކްލިނިކް ހުޅުމާލޭ',
    address: 'Hulhumale\' Phase II, Maldives',
    addressDv: 'ހުޅުމާލޭ ފޭސް ޓޫ، ދިވެހިރާއްޖެ',
    phone: '+960 7406788',
    location: {
      lat: 4.2165,
      lng: 73.5365,
      googleMapsUrl: 'https://maps.google.com/?q=Eve+Clinic+Hulhumale'
    },
    doctors: [
      { name: 'Dr. Mohamed Musthafa Farooq', specialization: 'Psychotherapist', time: '09:00 - 17:00' },
      { name: 'Dr. Nisha KC', specialization: 'Dermatologist', time: '09:00 - 17:00' },
      { name: 'Dr. Ibrahim Jaufar', specialization: 'Managing Director', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '41',
    name: 'Life Care Medical Centre - Dental',
    nameDv: 'ލައިފް ކޭއަރ މެޑިކަލް ސެންޓަރ - ޑެންޓަލް',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 3343333',
    location: {
      lat: 4.2160,
      lng: 73.5360,
      googleMapsUrl: 'https://maps.google.com/?q=Life+Care+Medical+Centre+Hulhumale'
    },
    doctors: [
      { name: 'Dr. Visiting Dentist', specialization: 'Dentist', time: '09:00 - 17:00' },
      { name: 'Dr. Visiting Dentist', specialization: 'Dentist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '42',
    name: 'EyeCare Maldives',
    nameDv: 'އައި ކޭއަރ މޯލްޑިވްސް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3332020',
    location: {
      lat: 4.1770,
      lng: 73.5100,
      googleMapsUrl: 'https://maps.google.com/?q=EyeCare+Maldives+Male'
    },
    doctors: [
      { name: 'Dr. Mohamed Azzam', specialization: 'Ophthalmologist (Retina)', time: '09:00 - 17:00' },
      { name: 'Dr. Amogh Dileep Asgaonkar', specialization: 'Vitreoretinal Surgeon', time: '09:00 - 17:00' },
      { name: 'Dr. Arjun Malla Bhari', specialization: 'Pediatric Ophthalmology', time: '09:00 - 17:00' },
      { name: 'Dr. Almas Adnan Ismail', specialization: 'Glaucoma Specialist', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Adib Uddin', specialization: 'General Ophthalmology', time: '09:00 - 17:00' },
      { name: 'Dr. Fahad Hossen', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Pooja Karki', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Vijayamani Janampalli', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Khondker Liaquat Ali', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Kausik Kumar Deb', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Sofiya Makajoo', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Mariyam Shahana Mufeed', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Nafeesa Abdul Latheef', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Mandhoof Moosa', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
      { name: 'Dr. Fathimath Shaamaly Jaufar', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '43',
    name: 'TTH Clinic Male',
    nameDv: 'ޓީޓީއެޗް ކްލިނިކް މާލެ',
    address: 'Buruzu Magu, Male\', Maldives',
    addressDv: 'ބުރުޒު މަގު، މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3351610',
    location: {
      lat: 4.1770,
      lng: 73.5085,
      googleMapsUrl: 'https://maps.google.com/?q=TTH+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Fiaz Jillani', specialization: 'Family Medicine', time: '08:00 - 17:00' },
      { name: 'Dr. Mahmoud Abbas', specialization: 'Internal Medicine', time: '08:00 - 17:00' },
      { name: 'Dr. Amith Narayana Pillai', specialization: 'Internal Medicine', time: '08:00 - 17:00' },
      { name: 'Dr. Muhammad Asad Ur Rehman Khan', specialization: 'Internal Medicine', time: '08:00 - 17:00' },
      { name: 'Dr. Pankaj Patawari', specialization: 'Endocrinologist', time: '20:30 - 22:30' },
    ]
  },
  {
    id: '44',
    name: 'Noosandha',
    nameDv: 'ނޫސަންދާ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3300078',
    location: {
      lat: 4.1660,
      lng: 73.4980,
      googleMapsUrl: 'https://maps.google.com/?q=Noosandha+Male'
    },
    doctors: [
      { name: 'Dr. Mohamed Shujau', specialization: 'Sub-Specialist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '45',
    name: 'Family Relationship Services',
    nameDv: 'ފެމިލީ ރިލޭޝަންޝިޕް ސާވިސަސް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3327341',
    location: {
      lat: 4.1655,
      lng: 73.4975,
      googleMapsUrl: 'https://maps.google.com/?q=Family+Relationship+Services+Male'
    },
    doctors: [
      { name: 'Dr. Aminath Shiyana Yahya', specialization: 'Psychologist & Family Mediator', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '46',
    name: 'Dr. Usama Clinic',
    nameDv: 'ޑރ. އުސާމާ ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3300000',
    location: {
      lat: 4.1650,
      lng: 73.4970,
      googleMapsUrl: 'https://maps.google.com/?q=Dr+Usama+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Usama Ali Omar', specialization: 'Medical Director & Diving Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '47',
    name: 'Image Centre',
    nameDv: 'އިމޭޖް ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3311111',
    location: {
      lat: 4.1645,
      lng: 73.4965,
      googleMapsUrl: 'https://maps.google.com/?q=Image+Centre+Male'
    },
    doctors: [
      { name: 'Dr. Mohamed Shaheed', specialization: 'Senior Medical Officer', time: '09:00 - 17:00' },
      { name: 'Dr. Subhash Gurnurkar', specialization: 'Anesthesiology', time: '09:00 - 17:00' },
      { name: 'Dr. Pradnya Jithendra Kutte', specialization: 'Gynecologist and Obstetrician', time: '09:00 - 17:00' },
      { name: 'Dr. Fauziah Gaphur', specialization: 'Dental Surgeon', time: '09:00 - 17:00' },
      { name: 'Dr. Amal Masoud Ramadan Baz', specialization: 'Pediatrician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '48',
    name: 'Omega Medical Centre',
    nameDv: 'އޮމޭގާ މެޑިކަލް ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3322222',
    location: {
      lat: 4.1640,
      lng: 73.4960,
      googleMapsUrl: 'https://maps.google.com/?q=Omega+Medical+Centre+Male'
    },
    doctors: [
      { name: 'Dr. Najas vp', specialization: 'Resident Doctor', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '49',
    name: 'Senahiya Military Hospital',
    nameDv: 'ސެނަހިޔާ މިލިޓަރީ ހޮސްޕިޓަލް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3333333',
    location: {
      lat: 4.1635,
      lng: 73.4955,
      googleMapsUrl: 'https://maps.google.com/?q=Senahiya+Military+Hospital+Male'
    },
    doctors: [
      { name: 'Dr. Chalam Mani', specialization: 'Medical Doctor', time: '09:00 - 17:00' },
      { name: 'Dr. Falih Ali', specialization: 'Pulmonologist', time: '09:00 - 17:00' },
      { name: 'Dr. Adam Ali', specialization: 'Internal Medicine Physician', time: '09:00 - 17:00' },
      { name: 'Dr. Kamal George', specialization: 'Consultant Dental Surgeon', time: '09:00 - 17:00' },
      { name: 'Dr. Rahul Kurup', specialization: 'General Dental Practitioner', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '50',
    name: 'Maldives Diagnostic Center',
    nameDv: 'މޯލްޑިވްސް ޑައިއެގްނޮސްޓިކް ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3344444',
    location: {
      lat: 4.1630,
      lng: 73.4950,
      googleMapsUrl: 'https://maps.google.com/?q=Maldives+Diagnostic+Center+Male'
    },
    doctors: [
      { name: 'Dr. Mohamed Ali', specialization: 'Internal Medicine Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '51',
    name: 'Crystal Medicals',
    nameDv: 'ކްރިސްޓަލް މެޑިކަލްސް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3355555',
    location: {
      lat: 4.1625,
      lng: 73.4945,
      googleMapsUrl: 'https://maps.google.com/?q=Crystal+Medicals+Male'
    },
    doctors: [
      { name: 'Dr. Aishath Shurooq Waheed', specialization: 'Medical Officer', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '52',
    name: 'Star Medical',
    nameDv: 'ސްޓާރ މެޑިކަލް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3366666',
    location: {
      lat: 4.1620,
      lng: 73.4940,
      googleMapsUrl: 'https://maps.google.com/?q=Star+Medical+Male'
    },
    doctors: [
      { name: 'Dr. Mohammad Nayem', specialization: 'Medical Director', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '53',
    name: 'Jibon Clinic',
    nameDv: 'ޖިބޯން ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3377777',
    location: {
      lat: 4.1615,
      lng: 73.4935,
      googleMapsUrl: 'https://maps.google.com/?q=Jibon+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '54',
    name: 'Thasalli Medical Care',
    nameDv: 'ތަސައްލީ މެޑިކަލް ކޭއަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3388888',
    location: {
      lat: 4.1610,
      lng: 73.4930,
      googleMapsUrl: 'https://maps.google.com/?q=Thasalli+Medical+Care+Male'
    },
    doctors: [
      { name: 'Dr. Faisal Saeed', specialization: 'Health Law', time: '09:00 - 17:00' },
      { name: 'Dr. Sohan Gupta', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Rukhsana Ahmed', specialization: 'Paediatrics', time: '09:00 - 17:00' },
      { name: 'Dr. Abdul Azeez Yoosuf', specialization: 'Internal Medicine', time: '09:00 - 17:00' },
      { name: 'Dr. Fatema Emrose Nisha', specialization: 'Surgery', time: '09:00 - 17:00' },
      { name: 'Dr. Binson Jose', specialization: 'Dentist', time: '09:00 - 17:00' },
      { name: 'Dr. Fathimath Thahseena Ibrahim', specialization: 'Radiologist', time: '09:00 - 17:00' },
      { name: 'Dr. Mariyam Ahmed', specialization: 'Obstetrics & Gynecology', time: '09:00 - 17:00' },
      { name: 'Dr. Mohamed Ashraf', specialization: 'General Surgery', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '55',
    name: 'Aahiyans Medical Clinic',
    nameDv: 'އާހިޔާންސް މެޑިކަލް ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7933326',
    location: {
      lat: 4.1605,
      lng: 73.4925,
      googleMapsUrl: 'https://maps.google.com/?q=Aahiyans+Medical+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '56',
    name: 'Ilaa Ali Adam Clinic',
    nameDv: 'އިލާ ޢަލީ އަދަމް ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3399999',
    location: {
      lat: 4.1600,
      lng: 73.4920,
      googleMapsUrl: 'https://maps.google.com/?q=Ilaa+Ali+Adam+Clinic+Male'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '57',
    name: 'Dharumavantha Hospital',
    nameDv: 'ދަރުމަވަންތާ ހޮސްޕިޓަލް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3335335',
    location: {
      lat: 4.1755,
      lng: 73.5085,
      googleMapsUrl: 'https://maps.google.com/?q=Dharumavantha+Hospital+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '58',
    name: 'Hope Health Care',
    nameDv: 'ހޯޕް ހެލްތް ކޭއަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 9508271',
    location: {
      lat: 4.1595,
      lng: 73.4915,
      googleMapsUrl: 'https://maps.google.com/?q=Hope+Health+Care+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '59',
    name: 'Uro Medical Care',
    nameDv: 'އުރޯ މެޑިކަލް ކޭއަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7897306',
    location: {
      lat: 4.1590,
      lng: 73.4910,
      googleMapsUrl: 'https://maps.google.com/?q=Uro+Medical+Care+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'Urologist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '60',
    name: 'Maldives Neuro Endocrine Medical Facility',
    nameDv: 'މޯލްޑިވްސް ނިއުރޯ އެންޑޯކްރައިން މެޑިކަލް ފެސިލިޓީ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7702662',
    location: {
      lat: 4.1585,
      lng: 73.4905,
      googleMapsUrl: 'https://maps.google.com/?q=Maldives+Neuro+Endocrine+Medical+Facility+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'Neurologist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '61',
    name: 'Shifaa Medical',
    nameDv: 'ޝިފާ މެޑިކަލް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7557677',
    location: {
      lat: 4.1580,
      lng: 73.4900,
      googleMapsUrl: 'https://maps.google.com/?q=Shifaa+Medical+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '62',
    name: 'Raaya Clinic',
    nameDv: 'ރާޔާ ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '',
    location: {
      lat: 4.1575,
      lng: 73.4895,
      googleMapsUrl: 'https://maps.google.com/?q=Raaya+Clinic+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '63',
    name: 'Furana Clinic',
    nameDv: 'ފުރާނާ ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '',
    location: {
      lat: 4.1570,
      lng: 73.4890,
      googleMapsUrl: 'https://maps.google.com/?q=Furana+Clinic+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '64',
    name: 'Pulse Medical and Diagnostics',
    nameDv: 'ޕަލްސް މެޑިކަލް އެންޑް ޑައިއެގްނޮސްޓިކްސް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 3000063',
    location: {
      lat: 4.1565,
      lng: 73.4885,
      googleMapsUrl: 'https://maps.google.com/?q=Pulse+Medical+and+Diagnostics+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '65',
    name: 'My Medical Center',
    nameDv: 'މައި މެޑިކަލް ސެންޓަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7778893',
    location: {
      lat: 4.1560,
      lng: 73.4880,
      googleMapsUrl: 'https://maps.google.com/?q=My+Medical+Center+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '66',
    name: 'Point Medical Care',
    nameDv: 'ޕޮއިންޓް މެޑިކަލް ކޭއަރ',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7776612',
    location: {
      lat: 4.1555,
      lng: 73.4875,
      googleMapsUrl: 'https://maps.google.com/?q=Point+Medical+Care+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '67',
    name: 'Well Care Medicals',
    nameDv: 'ވެލް ކޭއަރ މެޑިކަލްސް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7469981',
    location: {
      lat: 4.1550,
      lng: 73.4870,
      googleMapsUrl: 'https://maps.google.com/?q=Well+Care+Medicals+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '68',
    name: 'Silver Care Clinic',
    nameDv: 'ސިލްވަރ ކޭއަރ ކްލިނިކް',
    address: 'Male\', Maldives',
    addressDv: 'މާލެ، ދިވެހިރާއްޖެ',
    phone: '+960 7799633',
    location: {
      lat: 4.1545,
      lng: 73.4865,
      googleMapsUrl: 'https://maps.google.com/?q=Silver+Care+Clinic+Male+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  // Hulhumale' Clinics
  {
    id: '69',
    name: 'JIRAA Health Centre',
    nameDv: 'ޖިރާ ހެލްތް ސެންޓަރ',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 9110001',
    location: {
      lat: 4.2205,
      lng: 73.5405,
      googleMapsUrl: 'https://maps.google.com/?q=JIRAA+Health+Centre+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '70',
    name: 'Kaam Medical',
    nameDv: 'ކާމް މެޑިކަލް',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 7973538',
    location: {
      lat: 4.2210,
      lng: 73.5410,
      googleMapsUrl: 'https://maps.google.com/?q=Kaam+Medical+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '71',
    name: 'Life Wellness Clinic',
    nameDv: 'ލައިފްވެލްނެސް ކްލިނިކް',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 9191813',
    location: {
      lat: 4.2215,
      lng: 73.5415,
      googleMapsUrl: 'https://maps.google.com/?q=Life+Wellness+Clinic+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '72',
    name: 'Atoll Clinic',
    nameDv: 'އެޓޯލް ކްލިނިކް',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 7774091',
    location: {
      lat: 4.2220,
      lng: 73.5420,
      googleMapsUrl: 'https://maps.google.com/?q=Atoll+Clinic+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '73',
    name: 'NU Hospitals Clinic',
    nameDv: 'އެންޔޫ ހޮސްޕިޓަލްސް ކްލިނިކް',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 3353535',
    location: {
      lat: 4.2225,
      lng: 73.5425,
      googleMapsUrl: 'https://maps.google.com/?q=NU+Hospitals+Clinic+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'General Physician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '74',
    name: 'Sukoon Clinic',
    nameDv: 'ސުކޫން ކްލިނިކް',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '',
    location: {
      lat: 4.2230,
      lng: 73.5430,
      googleMapsUrl: 'https://maps.google.com/?q=Sukoon+Clinic+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'Therapist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '75',
    name: 'Dhivehi Beys Clinic',
    nameDv: 'ދިވެހި ބޭސް ކްލިނިކް',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 7940501',
    location: {
      lat: 4.2235,
      lng: 73.5435,
      googleMapsUrl: 'https://maps.google.com/?q=Dhivehi+Beys+Clinic+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. VisitingSpecialist', specialization: 'Traditional Medicine', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '76',
    name: 'Child Development Clinic',
    nameDv: 'ޗައިލްޑް ޑިވެލޮޕްމެންޓް ކްލިނިކް',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 3357033',
    location: {
      lat: 4.2240,
      lng: 73.5440,
      googleMapsUrl: 'https://maps.google.com/?q=Child+Development+Clinic+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'Pediatrician', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '77',
    name: 'Vision Clinic Hulhumalé',
    nameDv: 'ވިޝަން ކްލިނިކް ހުޅުމާލޭ',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 3350006',
    location: {
      lat: 4.2245,
      lng: 73.5445,
      googleMapsUrl: 'https://maps.google.com/?q=Vision+Clinic+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'Ophthalmologist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '78',
    name: 'Emerald Dental Care',
    nameDv: 'އެމެރަލްޑް ޑެންޓަލް ކޭއަރ',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 9900886',
    location: {
      lat: 4.2250,
      lng: 73.5450,
      googleMapsUrl: 'https://maps.google.com/?q=Emerald+Dental+Care+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Dentist', specialization: 'Dentist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '79',
    name: 'Family Dental Care',
    nameDv: 'ފެމިލީ ޑެންޓަލް ކޭއަރ',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 9904089',
    location: {
      lat: 4.2255,
      lng: 73.5455,
      googleMapsUrl: 'https://maps.google.com/?q=Family+Dental+Care+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Dentist', specialization: 'Dentist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '80',
    name: 'Smiles Dental Care Hulhumalé',
    nameDv: 'ސްމައިލްސް ޑެންޓަލް ކޭއަރ ހުޅުމާލޭ',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '',
    location: {
      lat: 4.2260,
      lng: 73.5460,
      googleMapsUrl: 'https://maps.google.com/?q=Smiles+Dental+Care+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Dentist', specialization: 'Dentist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '81',
    name: 'SC Dental Care',
    nameDv: 'އެސްސީ ޑެންޓަލް ކޭއަރ',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 7782329',
    location: {
      lat: 4.2265,
      lng: 73.5465,
      googleMapsUrl: 'https://maps.google.com/?q=SC+Dental+Care+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Dentist', specialization: 'Dentist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '82',
    name: 'Physio & Autism Clinic - Hulhumalé',
    nameDv: 'ފިޒިއޯ އެންޑް އޮޓިޒަމް ކްލިނިކް - ހުޅުމާލޭ',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 7852044',
    location: {
      lat: 4.2270,
      lng: 73.5470,
      googleMapsUrl: 'https://maps.google.com/?q=Physio+Autism+Clinic+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'Physiotherapist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '83',
    name: 'Wellcare Physiotherapy & Sports Rehabilitation',
    nameDv: 'ވެލްކޭއަރ ފިޒިއޯތެރަޕީ އެންޑް ސްޕޯޓްސް ރިހެބިލިޓޭޝަން',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 3330999',
    location: {
      lat: 4.2275,
      lng: 73.5475,
      googleMapsUrl: 'https://maps.google.com/?q=Wellcare+Physiotherapy+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'Physiotherapist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '84',
    name: 'Bluspan Care Annex - 1',
    nameDv: 'ބްލޫސްޕޭން ކޭއަރ އެނެކްސް - 1',
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 7943112',
    location: {
      lat: 4.2280,
      lng: 73.5480,
      googleMapsUrl: 'https://maps.google.com/?q=Bluspan+Care+Annex+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'Therapist', time: '09:00 - 17:00' },
    ]
  },
  {
    id: '85',
    name: "Faxy's Hijama Clinic",
    nameDv: "ފެކްސީސް ހިޖާމާ ކްލިނިކް",
    address: 'Hulhumale\', Maldives',
    addressDv: 'ހުޅުމާލޭ، ދިވެހިރާއްޖެ',
    phone: '+960 7787204',
    location: {
      lat: 4.2285,
      lng: 73.5485,
      googleMapsUrl: 'https://maps.google.com/?q=Faxy+Hijama+Clinic+Hulhumale+Maldives'
    },
    doctors: [
      { name: 'Dr. Visiting Specialist', specialization: 'Alternative Medicine', time: '09:00 - 17:00' },
    ]
  },
];

export default function DoctorsDuty() {
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [language, setLanguage] = useState<'dv' | 'en'>('dv');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'specialist' | 'doctor' | 'clinic'>('all');
  const [filterValue, setFilterValue] = useState('');
  const [advertisements, setAdvertisements] = useState<Record<string, any>>({});
  const [advertisementsError, setAdvertisementsError] = useState(false);

  // Fetch advertisements from Firebase
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const advertisementsDoc = await getDoc(doc(db, 'advertisements', 'slots'));
        if (advertisementsDoc.exists()) {
          setAdvertisements(advertisementsDoc.data() || {});
          setAdvertisementsError(false);
        } else {
          setAdvertisementsError(true);
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        setAdvertisementsError(true);
      }
    };

    fetchAdvertisements();
  }, []);

  // Get unique specializations
  const specializations = Array.from(
    new Set(
      clinicsData.flatMap(clinic => 
        clinic.doctors.map(doc => doc.specialization)
      )
    )
  ).sort();

  // Get unique doctor names
  const doctorNames = Array.from(
    new Set(
      clinicsData.flatMap(clinic => 
        clinic.doctors.map(doc => doc.name)
      )
    )
  ).sort();

  // Get unique clinic names
  const clinicNames = clinicsData.map(clinic => clinic.name).sort();

  // Calculate statistics
  const totalClinics = clinicsData.length;
  const totalHospitals = clinicsData.filter(clinic => 
    clinic.name.toLowerCase().includes('hospital')
  ).length;
  const totalDoctors = clinicsData.reduce((sum, clinic) => 
    sum + clinic.doctors.length, 0
  );

  // Acronym mapping for search
  const acronymMap: { [key: string]: string } = {
    'igmh': 'Indhira Gandhi Memorial Hospital',
    'adk': 'ADK Hospital',
    'tth': 'Tree Top Hospital',
    'amdc': 'AMDC - Azmi-Naeem Medical & Diagnostic Centre',
    'cmc': 'Central Medical Center',
  };

  // Create reverse mapping from full names to acronyms for easier lookup
  const nameToAcronymMap: { [key: string]: string } = {};
  Object.entries(acronymMap).forEach(([acronym, name]) => {
    nameToAcronymMap[name.toLowerCase()] = acronym;
  });

  // Filter clinics based on search and filter
  const filteredClinics = clinicsData.filter(clinic => {
    if (filterType === 'all' && searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      // Check if query matches an acronym
      const expandedQuery = acronymMap[query];
      
      // If it's an acronym, search for the expanded name using includes
      if (expandedQuery) {
        const clinicNameLower = clinic.name.toLowerCase();
        const expandedLower = expandedQuery.toLowerCase();
        return clinicNameLower.includes(expandedLower);
      }
      
      // Normal search
      return (
        clinic.name.toLowerCase().includes(query) ||
        clinic.nameDv.toLowerCase().includes(query) ||
        clinic.doctors.some(doc => 
          doc.name.toLowerCase().includes(query) ||
          doc.specialization.toLowerCase().includes(query)
        )
      );
    }
    
    if (filterType === 'specialist' && filterValue) {
      return clinic.doctors.some(doc => 
        doc.specialization.toLowerCase() === filterValue.toLowerCase()
      );
    }
    
    if (filterType === 'doctor' && filterValue) {
      return clinic.doctors.some(doc => 
        doc.name.toLowerCase() === filterValue.toLowerCase()
      );
    }
    
    if (filterType === 'clinic' && filterValue) {
      return clinic.name.toLowerCase() === filterValue.toLowerCase();
    }
    
    return true;
  }).sort((a, b) => b.doctors.length - a.doctors.length);

  const handleNavigate = (clinic: Clinic) => {
    if (clinic.location.googleMapsUrl) {
      window.open(clinic.location.googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {language === 'dv' ? 'ޑޮކްޓަރުންގެ ޑިއުޓީ' : 'Doctors Duty'}
          </h1>
          <p className="text-blue-100 text-lg mb-4">
            {language === 'dv' ? 'ކްލިނިކްތަކުގެ ޑޮކްޓަރުންގެ ޑިއުޓީ ޝެޑިއުލް' : 'Clinic Duty Schedules'}
          </p>
          
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{totalClinics}</div>
              <div className="text-sm text-blue-100">
                {language === 'dv' ? 'ކްލިނިކް' : 'Clinics'}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{totalHospitals}</div>
              <div className="text-sm text-blue-100">
                {language === 'dv' ? 'ހޮސްޕިޓަލް' : 'Hospitals'}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{totalDoctors}</div>
              <div className="text-sm text-blue-100">
                {language === 'dv' ? 'ޑޮކްޓަރުން' : 'Doctors'}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setLanguage(language === 'dv' ? 'en' : 'dv')}
            className="mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
          >
            {language === 'dv' ? 'English' : 'ދިވެހިބަސް'}
          </button>
        </div>
      </div>

      {/* Main Content with Advertisements */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Mobile Top Advertisement */}
        <div className="lg:hidden w-full">
          <div id="ad-doctors-mobile-top" className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center overflow-hidden">
            {advertisements['ad-doctors-left-medium-160x256']?.image ? (
              <img src={advertisements['ad-doctors-left-medium-160x256'].image} alt="Advertisement" className="w-full h-full object-cover" />
            ) : advertisementsError ? (
              <img src="/promotions/default-ad.jpg" alt="Advertisement" className="w-full h-full object-cover" />
            ) : (
              <p className="text-gray-500 text-sm text-center px-2">Advertisement</p>
            )}
          </div>
        </div>

        {/* Left Advertisement (Desktop) */}
        <div className="hidden lg:block w-48 flex-shrink-0">
          <div className="sticky top-4 space-y-4">
            <div id="ad-doctors-left-tall-160x384" className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center overflow-hidden">
              {advertisements['ad-doctors-left-tall-160x384']?.image ? (
                <img src={advertisements['ad-doctors-left-tall-160x384'].image} alt="Advertisement" className="w-full h-full object-cover" />
              ) : advertisementsError ? (
                <img src="/promotions/default-ad.jpg" alt="Advertisement" className="w-full h-full object-cover" />
              ) : (
                <p className="text-gray-500 text-sm text-center px-2">Advertisement (160x384)</p>
              )}
            </div>
            <div id="ad-doctors-left-medium-160x256" className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center overflow-hidden">
              {advertisements['ad-doctors-left-medium-160x256']?.image ? (
                <img src={advertisements['ad-doctors-left-medium-160x256'].image} alt="Advertisement" className="w-full h-full object-cover" />
              ) : advertisementsError ? (
                <img src="/promotions/default-ad.jpg" alt="Advertisement" className="w-full h-full object-cover" />
              ) : (
                <p className="text-gray-500 text-sm text-center px-2">Advertisement (160x256)</p>
              )}
            </div>
            <div id="ad-doctors-left-medium-160x256-2" className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center overflow-hidden">
              {advertisements['ad-doctors-left-medium-160x256-2']?.image ? (
                <img src={advertisements['ad-doctors-left-medium-160x256-2'].image} alt="Advertisement" className="w-full h-full object-cover" />
              ) : advertisementsError ? (
                <img src="/promotions/default-ad.jpg" alt="Advertisement" className="w-full h-full object-cover" />
              ) : (
                <p className="text-gray-500 text-sm text-center px-2">Advertisement (160x256)</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid gap-4 md:grid-cols-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder={language === 'dv' ? 'ހޯދާލައި...' : 'Search doctors, clinics...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setFilterType('all');
                  setFilterValue('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Type Dropdown */}
            <div>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as 'all' | 'specialist' | 'doctor' | 'clinic');
                  setFilterValue('');
                  setSearchQuery('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{language === 'dv' ? 'ހުރިހާ' : 'All'}</option>
                <option value="specialist">{language === 'dv' ? 'ސްޕެޝަލިސްޓް' : 'Specialist'}</option>
                <option value="doctor">{language === 'dv' ? 'ޑޮކްޓަރު' : 'Doctor'}</option>
                <option value="clinic">{language === 'dv' ? 'ކްލިނިކް' : 'Clinic'}</option>
              </select>
            </div>
            
            {/* Filter Value Dropdown */}
            <div>
              {filterType === 'specialist' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{language === 'dv' ? 'އިޚްތާރުކުރުމަށް' : 'Select specialist'}</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              )}
              {filterType === 'doctor' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{language === 'dv' ? 'އިޚްތާރުކުރުމަށް' : 'Select doctor'}</option>
                  {doctorNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              )}
              {filterType === 'clinic' && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{language === 'dv' ? 'އިޚްތާރުކުރުމަށް' : 'Select clinic'}</option>
                  {clinicNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              )}
              {filterType === 'all' && (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  {language === 'dv' ? 'ފިލްޓަރު އިޚްތާރުކުރުމަށް' : 'Select filter type'}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Clinics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClinics.map((clinic, index) => (
          <React.Fragment key={clinic.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-teal-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedClinic(clinic)}
            >
              {/* Clinic Header */}
              <div className="bg-teal-600 text-white p-4">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {language === 'dv' ? clinic.nameDv : clinic.name}
                    </h3>
                    <p className="text-teal-100 text-xs mt-1">
                      {language === 'dv' ? clinic.addressDv : clinic.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Doctors List */}
              <div className="p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'dv' ? 'ޑޮކްޓަރުން' : 'Doctors'}
                  </span>
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                    {clinic.doctors.length}
                  </span>
                </div>
                {clinic.doctors.slice(0, 1).map((doctor, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded p-2 mb-2"
                  >
                    <p className="text-sm font-medium text-gray-900">{doctor.name}</p>
                    <p className="text-xs text-gray-600">{doctor.specialization}</p>
                  </div>
                ))}
                {clinic.doctors.length > 1 && (
                  <p className="text-xs text-teal-600 font-medium">
                    {language === 'dv' 
                      ? `+${clinic.doctors.length - 1} އިތުރު` 
                      : `+${clinic.doctors.length - 1} more`}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div className="p-3 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">{clinic.phone}</span>
                </div>
                <a
                  href={`tel:${clinic.phone}`}
                  className="text-xs bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 transition"
                >
                  {language === 'dv' ? 'ކޯލް' : 'Call'}
                </a>
              </div>
            </motion.div>
            {/* Mobile advertisement after every 4 clinics */}
            {(index + 1) % 4 === 0 && index + 1 < filteredClinics.length && (
              <div className="lg:hidden col-span-1 md:col-span-2">
                <div className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center overflow-hidden">
                  {advertisements[`ad-doctors-mobile-${Math.floor((index + 1) / 4)}`]?.image ? (
                    <img src={advertisements[`ad-doctors-mobile-${Math.floor((index + 1) / 4)}`].image} alt="Advertisement" className="w-full h-full object-cover" />
                  ) : advertisementsError ? (
                    <img src="/promotions/default-ad.jpg" alt="Advertisement" className="w-full h-full object-cover" />
                  ) : (
                    <p className="text-gray-500 text-sm text-center px-2">Advertisement</p>
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50 rounded-2xl p-6 text-center mt-8">
        <p className="text-gray-700">
          {language === 'dv'
            ? 'މި މަޢުލަވެސް އިންފޮމޭޝަން ހުރިހާ ކްލިނިކްތަކުގެ ޑޮކްޓަރުންގެ ޑިއުޓީ ޝެޑިއުލް އަންނަނީ ކްލިނިކްތުންނެވެ. އެކަމަކު ބައެއް ކްލިނިކްތަކުގެ ޑިއުޓީ ޝެޑިއުލް ބަދަލުވުމަކީ އެކަށީގެ ކަމެކެވެ. އެހެންކަމުން ކްލިނިކަށް ކޮލް ކުރުމުގައި ހިތްވާތި އެކަށީގެ ޑިއުޓީ ޝެޑިއުލް ހޯދާށެވެ.'
            : 'This information shows doctor duty schedules from various clinics. However, duty schedules may change. Please verify with the clinic before visiting.'}
        </p>
      </div>
        </div>

        {/* Right Advertisement (Desktop) */}
        <div className="hidden lg:block w-48 flex-shrink-0">
          <div className="sticky top-4 space-y-4">
            <div id="ad-doctors-right-tall-160x384" className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center overflow-hidden">
              {advertisements['ad-doctors-right-tall-160x384']?.image ? (
                <img src={advertisements['ad-doctors-right-tall-160x384'].image} alt="Advertisement" className="w-full h-full object-cover" />
              ) : advertisementsError ? (
                <img src="/promotions/default-ad.jpg" alt="Advertisement" className="w-full h-full object-cover" />
              ) : (
                <p className="text-gray-500 text-sm text-center px-2">Advertisement (160x384)</p>
              )}
            </div>
            <div id="ad-doctors-right-medium-160x256" className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center overflow-hidden">
              {advertisements['ad-doctors-right-medium-160x256']?.image ? (
                <img src={advertisements['ad-doctors-right-medium-160x256'].image} alt="Advertisement" className="w-full h-full object-cover" />
              ) : advertisementsError ? (
                <img src="/promotions/default-ad.jpg" alt="Advertisement" className="w-full h-full object-cover" />
              ) : (
                <p className="text-gray-500 text-sm text-center px-2">Advertisement (160x256)</p>
              )}
            </div>
            <div id="ad-doctors-right-medium-160x256-2" className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center overflow-hidden">
              {advertisements['ad-doctors-right-medium-160x256-2']?.image ? (
                <img src={advertisements['ad-doctors-right-medium-160x256-2'].image} alt="Advertisement" className="w-full h-full object-cover" />
              ) : advertisementsError ? (
                <img src="/promotions/default-ad.jpg" alt="Advertisement" className="w-full h-full object-cover" />
              ) : (
                <p className="text-gray-500 text-sm text-center px-2">Advertisement (160x256)</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clinic Detail Modal */}
      <AnimatePresence>
        {selectedClinic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedClinic(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 sticky top-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {language === 'dv' ? selectedClinic.nameDv : selectedClinic.name}
                    </h2>
                    <p className="text-blue-100 mt-1">
                      {language === 'dv' ? selectedClinic.addressDv : selectedClinic.address}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedClinic(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Contact Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {language === 'dv' ? 'ފޯން:' : 'Phone:'}
                      </p>
                      <p className="font-semibold text-gray-900 text-lg">{selectedClinic.phone}</p>
                    </div>
                    <a
                      href={`tel:${selectedClinic.phone}`}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
                    >
                      {language === 'dv' ? 'ކޯލް' : 'Call'}
                    </a>
                  </div>
                </div>

                {/* Doctors List */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {language === 'dv' ? 'ޑޮކްޓަރުން' : 'Doctors'}
                </h3>
                <div className="space-y-4">
                  {selectedClinic.doctors.map((doctor, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-4 border border-blue-100"
                    >
                      <p className="font-bold text-gray-900 text-lg">{doctor.name}</p>
                      <p className="text-gray-700 mt-1">{doctor.specialization}</p>
                      <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {doctor.time}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation Button */}
                <button
                  onClick={() => handleNavigate(selectedClinic)}
                  className="w-full mt-6 px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-3 font-semibold text-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {language === 'dv' ? 'މެޕްގައި ހޯދާ' : 'Navigate on Map'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Replace with actual login user ID/token
    fetch("http://localhost:5000/api/user/me")
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => alert("Unable to load profile"));
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulated profile photo upload (you can replace with real API logic)
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      <div className="profile-card">
        <div className="profile-img">
          <img src={profile.photo || "/default-avatar.png"} alt="avatar" />
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div className="profile-info">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Attendance Marked:</strong> {profile.attendanceCount}</p>
          <p><strong>Leaves Taken:</strong> {profile.leaveCount}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

import React from "react";

function Home({ signOut, user }) {
  console.log("User Object:", user);

  // Check if user object exists
  if (!user || !user.signInUserSession) {
    return (
      <div>
        <h1>Non-User</h1>
      
      </div>
    );
  }

  // Extract groups
  const groups =
    user?.signInUserSession?.accessToken?.payload?.["cognito:groups"] || [];
  console.log("User Groups:", groups);

  // Check if user is in the "Admin" group
  const isAdmin = groups.includes("Admin");

  return (
    <div>
      <h1>{isAdmin ? "Hi Admin" : "Hi User"}</h1>
      <button onClick={signOut}>Sign out</button>
      {isAdmin ? <p>You have admin access.</p> : <p>You have user access.</p>}
      <a href="/fetch-audio">Fetch Audio</a>
      <br />
      {isAdmin ? <a href="/upload-audio">Upload Audio</a> : null}
    </div>
  );
}

export default Home;

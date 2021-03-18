import React from 'react';
import { withRouter,Link, useHistory} from "react-router-dom";


function Footer() {
  let history = useHistory();
  const nowPath = history.location.pathname;
  if(nowPath.startsWith("/up")) return null
  return (
      <footer className="footer">
        <p className="upload_btn"><Link to="/upload">Upload</Link></p>
      </footer>
  )
}

export default withRouter(Footer);
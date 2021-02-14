import React from 'react';
import { withRouter,Link} from "react-router-dom";


function Footer() {
  return (
      <footer className="footer">
        <p className="upload_btn"><Link to="/upload">Upload</Link></p>
      </footer>
  )
}

export default withRouter(Footer);
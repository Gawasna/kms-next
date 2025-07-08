import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    //route to login page ("/auth/login")
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to the Login Page</h1>
      <p className={styles.description}>
        Please click the button below to go to the login page.
      </p>
      <a href="/auth/login" className={styles.button}>
        Go to Login Page
      </a>
      <p className={styles.footer}>
        This is a simple prototype for a login page. Please navigate to the login page to proceed.
      </p>
    </div>
  );
}

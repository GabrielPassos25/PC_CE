import MyForm from '../components/Form';
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <MyForm />
    </div>
  );
}
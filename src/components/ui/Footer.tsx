import React from 'react';
import Link from 'next/link';
import s from './styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.footerContent}>
        <p>© {new Date().getFullYear()} KIMS Next App. All rights reserved.</p>
        <nav className={s.footerNav}>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/contact">Contact Us</Link>
        </nav>
      </div>
    </footer>
  );
}
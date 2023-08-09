-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 09 Agu 2023 pada 10.11
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `inventorydb`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `history`
--

CREATE TABLE `history` (
  `idHistory` int(11) NOT NULL,
  `tanggal` date DEFAULT NULL,
  `jumlah` int(11) DEFAULT NULL,
  `idReturn` int(11) DEFAULT NULL,
  `idTransaksi` int(11) DEFAULT NULL,
  `idBarang` int(11) DEFAULT NULL,
  `idSKU` int(11) DEFAULT NULL,
  `jenis_transaksi` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `kasir`
--

CREATE TABLE `kasir` (
  `idTransaksi` int(11) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `idSKU` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kasir`
--

INSERT INTO `kasir` (`idTransaksi`, `jumlah`, `idSKU`) VALUES
(23, 10, 16);

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `idBarang` int(11) NOT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `indicator` int(11) DEFAULT NULL,
  `harga` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`idBarang`, `nama`, `indicator`, `harga`) VALUES
(1, 'Produk A', 100, 20000),
(2, 'Produk B', 200, 500000);

-- --------------------------------------------------------

--
-- Struktur dari tabel `return_items`
--

CREATE TABLE `return_items` (
  `id` int(11) NOT NULL,
  `idBarang` int(11) DEFAULT NULL,
  `idSKU` int(11) DEFAULT NULL,
  `jumlah` varchar(50) NOT NULL,
  `alasan` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `return_items`
--

INSERT INTO `return_items` (`id`, `idBarang`, `idSKU`, `jumlah`, `alasan`) VALUES
(22, 1, 16, '1', 'Rusak'),
(23, 1, 16, '1', 'Salah Barang'),
(24, 2, 17, '1', 'Salah Barang'),
(25, 2, 17, '1', 'Salah Barang'),
(26, 2, 17, '1', 'Salah Barang'),
(27, 1, 16, '1', 'Salah Barang'),
(28, 2, 17, '1', 'Salah Barang'),
(29, 2, 6, '1', 'Salah Barang'),
(30, 1, 1, '1', 'Salah Barang'),
(31, 2, 17, '1', 'Salah Barang'),
(32, 2, 17, '1', 'Rusak'),
(33, 1, 16, '1', 'Salah Barang'),
(34, 2, 17, '1', 'Salah Barang'),
(35, 1, 1, '1', 'Salah Barang'),
(36, 2, 17, '4', 'Rusak'),
(37, 1, 1, '3', 'Rusak');

-- --------------------------------------------------------

--
-- Struktur dari tabel `skus`
--

CREATE TABLE `skus` (
  `idSKU` int(11) NOT NULL,
  `skuCode` varchar(50) DEFAULT NULL,
  `productionDate` date DEFAULT NULL,
  `expiredDate` date DEFAULT NULL,
  `inboundDate` date DEFAULT NULL,
  `stok` int(11) DEFAULT NULL,
  `idBarang` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `skus`
--

INSERT INTO `skus` (`idSKU`, `skuCode`, `productionDate`, `expiredDate`, `inboundDate`, `stok`, `idBarang`) VALUES
(1, 'SKU001', '2023-08-01', '2023-12-31', '2023-07-15', 35, 1),
(6, 'SKU101', '2023-08-01', '2024-12-31', '2023-07-15', 60, 2),
(16, '12345', '2013-08-01', '2026-08-01', '2022-08-01', 78, 1),
(17, '6789', '2013-10-01', '2036-10-01', '2020-10-01', 61, 2),
(26, '3234', '2023-08-01', '2023-08-03', '2023-08-02', 12, 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`) VALUES
(1, 'admin', 'superuser1');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`idHistory`),
  ADD KEY `history_ibfk_1` (`idBarang`),
  ADD KEY `history_ibfk_2` (`idSKU`),
  ADD KEY `idReturn` (`idReturn`),
  ADD KEY `history_ibfk_3` (`idTransaksi`);

--
-- Indeks untuk tabel `kasir`
--
ALTER TABLE `kasir`
  ADD PRIMARY KEY (`idTransaksi`),
  ADD KEY `idSKU` (`idSKU`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`idBarang`);

--
-- Indeks untuk tabel `return_items`
--
ALTER TABLE `return_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idBarang` (`idBarang`),
  ADD KEY `idSKU` (`idSKU`);

--
-- Indeks untuk tabel `skus`
--
ALTER TABLE `skus`
  ADD PRIMARY KEY (`idSKU`),
  ADD KEY `idBarang` (`idBarang`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `history`
--
ALTER TABLE `history`
  MODIFY `idHistory` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `kasir`
--
ALTER TABLE `kasir`
  MODIFY `idTransaksi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `idBarang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT untuk tabel `return_items`
--
ALTER TABLE `return_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT untuk tabel `skus`
--
ALTER TABLE `skus`
  MODIFY `idSKU` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `history`
--
ALTER TABLE `history`
  ADD CONSTRAINT `history_ibfk_1` FOREIGN KEY (`idBarang`) REFERENCES `products` (`idBarang`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `history_ibfk_2` FOREIGN KEY (`idSKU`) REFERENCES `skus` (`idSKU`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `history_ibfk_3` FOREIGN KEY (`idTransaksi`) REFERENCES `kasir` (`idTransaksi`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `history_ibfk_4` FOREIGN KEY (`idReturn`) REFERENCES `return_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `kasir`
--
ALTER TABLE `kasir`
  ADD CONSTRAINT `kasir_ibfk_1` FOREIGN KEY (`idSKU`) REFERENCES `skus` (`idSKU`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `return_items`
--
ALTER TABLE `return_items`
  ADD CONSTRAINT `return_items_ibfk_1` FOREIGN KEY (`idBarang`) REFERENCES `products` (`idBarang`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `return_items_ibfk_2` FOREIGN KEY (`idSKU`) REFERENCES `skus` (`idSKU`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `skus`
--
ALTER TABLE `skus`
  ADD CONSTRAINT `skus_ibfk_1` FOREIGN KEY (`idBarang`) REFERENCES `products` (`idBarang`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

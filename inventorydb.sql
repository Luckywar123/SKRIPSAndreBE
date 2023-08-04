-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 04 Agu 2023 pada 16.53
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
  `idSKU` int(11) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `jumlah` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `idBarang` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `kasir`
--

CREATE TABLE `kasir` (
  `idKasir` int(11) NOT NULL,
  `nama_barang` varchar(100) NOT NULL,
  `harga_satuan` int(11) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `idSKU` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `idBarang` int(11) NOT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `indicator` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`idBarang`, `nama`, `indicator`) VALUES
(1, 'Produk A', 100),
(2, 'Produk B', 200);

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
(1, 'SKU001', '2023-08-01', '2023-12-31', '2023-07-15', 50, 1),
(2, 'SKU002', '2023-08-02', '2023-12-31', '2023-07-15', 30, 1),
(3, 'SKU003', '2023-08-03', '2023-12-31', '2023-07-15', 40, 1),
(4, 'SKU004', '2023-08-04', '2023-12-31', '2023-07-15', 20, 1),
(5, 'SKU005', '2023-08-05', '2023-12-31', '2023-07-15', 10, 1),
(6, 'SKU101', '2023-08-01', '2024-12-31', '2023-07-15', 60, 2),
(7, 'SKU102', '2023-08-02', '2024-12-31', '2023-07-15', 80, 2),
(8, 'SKU103', '2023-08-03', '2024-12-31', '2023-07-15', 90, 2),
(9, 'SKU104', '2023-08-04', '2024-12-31', '2023-07-15', 70, 2),
(10, 'SKU105', '2023-08-05', '2024-12-31', '2023-07-15', 50, 2);

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaksi`
--

CREATE TABLE `transaksi` (
  `idTransaksi` int(11) NOT NULL,
  `kode_transaksi` varchar(50) DEFAULT NULL,
  `jenis_transaksi` varchar(50) DEFAULT NULL,
  `harga` decimal(10,2) DEFAULT NULL,
  `tanggal` date DEFAULT NULL,
  `idKasir` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  ADD KEY `idSKU` (`idSKU`),
  ADD KEY `idBarang` (`idBarang`);

--
-- Indeks untuk tabel `kasir`
--
ALTER TABLE `kasir`
  ADD PRIMARY KEY (`idKasir`),
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
-- Indeks untuk tabel `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`idTransaksi`),
  ADD KEY `idKasir` (`idKasir`);

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
  MODIFY `idHistory` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `kasir`
--
ALTER TABLE `kasir`
  MODIFY `idKasir` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `idBarang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `return_items`
--
ALTER TABLE `return_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `skus`
--
ALTER TABLE `skus`
  MODIFY `idSKU` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `idTransaksi` int(11) NOT NULL AUTO_INCREMENT;

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
  ADD CONSTRAINT `history_ibfk_1` FOREIGN KEY (`idSKU`) REFERENCES `skus` (`idSKU`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `history_ibfk_2` FOREIGN KEY (`idBarang`) REFERENCES `products` (`idBarang`) ON DELETE CASCADE ON UPDATE CASCADE;

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

--
-- Ketidakleluasaan untuk tabel `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `transaksi_ibfk_1` FOREIGN KEY (`idKasir`) REFERENCES `kasir` (`idKasir`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

USE [master]
GO
/****** Object:  Database [HorseRacingDB]    Script Date: 6/11/2026 2:23:38 PM ******/
CREATE DATABASE [HorseRacingDB]
 CONTAINMENT = NONE
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [HorseRacingDB] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [HorseRacingDB].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [HorseRacingDB] SET ANSI_NULL_DEFAULT OFF
GO
ALTER DATABASE [HorseRacingDB] SET ANSI_NULLS OFF
GO
ALTER DATABASE [HorseRacingDB] SET ANSI_PADDING OFF
GO
ALTER DATABASE [HorseRacingDB] SET ANSI_WARNINGS OFF
GO
ALTER DATABASE [HorseRacingDB] SET ARITHABORT OFF
GO
ALTER DATABASE [HorseRacingDB] SET AUTO_CLOSE OFF
GO
ALTER DATABASE [HorseRacingDB] SET AUTO_SHRINK OFF
GO
ALTER DATABASE [HorseRacingDB] SET AUTO_UPDATE_STATISTICS ON
GO
ALTER DATABASE [HorseRacingDB] SET CURSOR_CLOSE_ON_COMMIT OFF
GO
ALTER DATABASE [HorseRacingDB] SET CURSOR_DEFAULT  GLOBAL
GO
ALTER DATABASE [HorseRacingDB] SET CONCAT_NULL_YIELDS_NULL OFF
GO
ALTER DATABASE [HorseRacingDB] SET NUMERIC_ROUNDABORT OFF
GO
ALTER DATABASE [HorseRacingDB] SET QUOTED_IDENTIFIER OFF
GO
ALTER DATABASE [HorseRacingDB] SET RECURSIVE_TRIGGERS OFF
GO
ALTER DATABASE [HorseRacingDB] SET  DISABLE_BROKER
GO
ALTER DATABASE [HorseRacingDB] SET AUTO_UPDATE_STATISTICS_ASYNC OFF
GO
ALTER DATABASE [HorseRacingDB] SET DATE_CORRELATION_OPTIMIZATION OFF
GO
ALTER DATABASE [HorseRacingDB] SET TRUSTWORTHY OFF
GO
ALTER DATABASE [HorseRacingDB] SET ALLOW_SNAPSHOT_ISOLATION OFF
GO
ALTER DATABASE [HorseRacingDB] SET PARAMETERIZATION SIMPLE
GO
ALTER DATABASE [HorseRacingDB] SET READ_COMMITTED_SNAPSHOT OFF
GO
ALTER DATABASE [HorseRacingDB] SET HONOR_BROKER_PRIORITY OFF
GO
ALTER DATABASE [HorseRacingDB] SET RECOVERY SIMPLE
GO
ALTER DATABASE [HorseRacingDB] SET  MULTI_USER
GO
ALTER DATABASE [HorseRacingDB] SET PAGE_VERIFY CHECKSUM
GO
ALTER DATABASE [HorseRacingDB] SET DB_CHAINING OFF
GO
ALTER DATABASE [HorseRacingDB] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF )
GO
ALTER DATABASE [HorseRacingDB] SET TARGET_RECOVERY_TIME = 60 SECONDS
GO
ALTER DATABASE [HorseRacingDB] SET DELAYED_DURABILITY = DISABLED
GO
ALTER DATABASE [HorseRacingDB] SET ACCELERATED_DATABASE_RECOVERY = OFF
GO
ALTER DATABASE [HorseRacingDB] SET QUERY_STORE = ON
GO
ALTER DATABASE [HorseRacingDB] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [HorseRacingDB]
GO
/****** Object:  Table [dbo].[ban_history]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ban_history](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[blacklist_id] [int] NOT NULL,
	[action_by] [int] NOT NULL,
	[action_note] [nvarchar](500) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[bets]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[bets](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[race_id] [int] NOT NULL,
	[participant_id] [int] NOT NULL,
	[amount] [decimal](18, 2) NOT NULL,
	[odds] [decimal](10, 2) NOT NULL,
	[status] [nvarchar](20) NULL,
	[payout_amount] [decimal](18, 2) NULL,
	[bet_type] [nvarchar](20) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[betting_transactions]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[betting_transactions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[bet_id] [int] NOT NULL,
	[wallet_transaction_id] [int] NOT NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[blacklist]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[blacklist](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[target_type] [nvarchar](50) NOT NULL,
	[target_id] [int] NOT NULL,
	[reason] [nvarchar](500) NULL,
	[start_date] [date] NOT NULL,
	[end_date] [date] NULL,
	[is_permanent] [bit] NULL,
	[status] [nvarchar](20) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[chat_messages]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[chat_messages](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[room_id] [int] NOT NULL,
	[sender_id] [int] NOT NULL,
	[message] [nvarchar](max) NOT NULL,
	[message_type] [nvarchar](20) NULL,
	[is_deleted] [bit] NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[chat_rooms]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[chat_rooms](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[race_id] [int] NOT NULL,
	[status] [nvarchar](20) NULL,
	[created_at] [datetime] NULL,
	[closed_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED
(
	[race_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[horse_breeds]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[horse_breeds](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[breed_name] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED
(
	[breed_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[horse_owner_profiles]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[horse_owner_profiles](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[stable_name] [nvarchar](100) NULL,
	[bank_account] [nvarchar](100) NULL,
	[approval_status] [nvarchar](20) NULL,
	[stable_address] [nvarchar](255) NULL,
	[description] [nvarchar](500) NULL,
	[reputation_stars] [float] NULL,
	[phone] [varchar](20) NULL,
	[identity_number] [varchar](50) NULL,
	[date_of_birth] [date] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[horses]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[horses](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[owner_id] [int] NOT NULL,
	[breed_id] [int] NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[age] [int] NULL,
	[gender] [nvarchar](20) NULL,
	[color] [nvarchar](50) NULL,
	[training_status] [nvarchar](50) NULL,
	[health_status] [nvarchar](50) NULL,
	[speed_rating] [float] NULL,
	[status] [nvarchar](20) NULL,
	[stamina_rating] [int] NULL,
	[gate_performance_rating] [int] NULL,
	[image_url] [nvarchar](1000) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[jockey_agreements]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[jockey_agreements](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[owner_id] [int] NOT NULL,
	[jockey_id] [int] NOT NULL,
	[message] [nvarchar](500) NULL,
	[status] [nvarchar](50) NULL,
	[sent_at] [datetime] NULL,
	[responded_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[jockey_profiles]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[jockey_profiles](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[height] [float] NULL,
	[weight] [float] NULL,
	[win_rate] [float] NULL,
	[experience_year] [int] NULL,
	[ranking_score] [int] NULL,
	[license_number] [nvarchar](100) NULL,
	[bank_account] [nvarchar](100) NULL,
	[approval_status] [nvarchar](20) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[notifications]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[notifications](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[title] [nvarchar](255) NOT NULL,
	[content] [nvarchar](max) NOT NULL,
	[type] [nvarchar](50) NULL,
	[is_read] [bit] NULL,
	[created_at] [datetime] NULL,
	[read_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[password_reset_tokens]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[password_reset_tokens](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[expiry_date] [datetime2](6) NOT NULL,
	[token] [varchar](255) NOT NULL,
	[user_id] [int] NOT NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UK71lqwbwtklmljk3qlsugr1mig] UNIQUE NONCLUSTERED
(
	[token] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UKla2ts67g4oh2sreayswhox1i6] UNIQUE NONCLUSTERED
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[prize_distributions]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[prize_distributions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[participant_id] [int] NOT NULL,
	[total_prize] [decimal](18, 2) NOT NULL,
	[owner_amount] [decimal](18, 2) NOT NULL,
	[jockey_amount] [decimal](18, 2) NOT NULL,
	[platform_fee] [decimal](18, 2) NOT NULL,
	[status] [nvarchar](20) NULL,
	[created_at] [datetime] NULL,
	[distributed_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[race_participants]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[race_participants](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[race_id] [int] NOT NULL,
	[horse_id] [int] NOT NULL,
	[jockey_id] [int] NOT NULL,
	[gate_number] [int] NULL,
	[final_rank] [int] NULL,
	[finish_time] [int] NULL,
	[average_speed] [float] NULL,
	[status] [nvarchar](50) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_race_horse] UNIQUE NONCLUSTERED
(
	[race_id] ASC,
	[horse_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_race_jockey] UNIQUE NONCLUSTERED
(
	[race_id] ASC,
	[jockey_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[race_registrations]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[race_registrations](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[race_id] [int] NOT NULL,
	[horse_id] [int] NOT NULL,
	[jockey_id] [int] NOT NULL,
	[owner_id] [int] NOT NULL,
	[status] [nvarchar](50) NULL,
	[created_at] [datetime] NULL,
	[jockey_share_percent] [float] NULL,
	[owner_share_percent] [float] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[race_simulations]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[race_simulations](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[race_id] [int] NOT NULL,
	[start_time] [datetime] NULL,
	[end_time] [datetime] NULL,
	[status] [nvarchar](50) NULL,
	[current_tick] [int] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[race_tracks]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[race_tracks](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[location] [nvarchar](255) NULL,
	[surface_condition] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[races]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[races](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[race_name] [nvarchar](255) NOT NULL,
	[tournament_id] [int] NOT NULL,
	[race_track_id] [int] NOT NULL,
	[race_date] [date] NOT NULL,
	[race_time] [time](7) NOT NULL,
	[race_round] [int] NOT NULL,
	[max_horses] [int] NOT NULL,
	[distance] [float] NOT NULL,
	[surface_type] [nvarchar](50) NULL,
	[weather] [nvarchar](50) NULL,
	[status] [nvarchar](50) NULL,
	[end_time] [time](7) NULL,
	[referee_id] [int] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[referee_flags]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[referee_flags](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[referee_id] [int] NOT NULL,
	[horse_id] [int] NOT NULL,
	[simulation_id] [int] NOT NULL,
	[violation_type] [nvarchar](50) NOT NULL,
	[description] [nvarchar](500) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[refresh_tokens]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[refresh_tokens](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[expiry_date] [datetimeoffset](6) NOT NULL,
	[revoked] [bit] NOT NULL,
	[token] [varchar](512) NOT NULL,
	[user_id] [int] NOT NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UKghpmfn23vmxfu3spu3lfg4r2d] UNIQUE NONCLUSTERED
(
	[token] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[role_upgrade_requests]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[role_upgrade_requests](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[requested_role_id] [int] NOT NULL,
	[status] [nvarchar](20) NULL,
	[submitted_at] [datetime] NULL,
	[reviewed_by] [int] NULL,
	[reviewed_at] [datetime] NULL,
	[rejection_reason] [nvarchar](500) NULL,
	[notes] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[roles]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[roles](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[role_name] [varchar](50) NOT NULL,
	[description] [text] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[simulation_horse_states]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[simulation_horse_states](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[simulation_id] [int] NOT NULL,
	[horse_id] [int] NOT NULL,
	[current_position] [float] NULL,
	[speed] [float] NULL,
	[acceleration] [float] NULL,
	[stamina] [float] NULL,
	[rank_in_race] [int] NULL,
	[status] [nvarchar](50) NULL,
	[last_updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tournaments]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tournaments](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[tournament_name] [nvarchar](255) NOT NULL,
	[location] [nvarchar](255) NULL,
	[description] [nvarchar](1000) NULL,
	[registration_deadline] [datetime] NULL,
	[max_slots] [int] NULL,
	[start_date] [date] NULL,
	[end_date] [date] NULL,
	[total_prize] [decimal](18, 2) NULL,
	[tournament_status] [nvarchar](50) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
	[min_bet_amount] [numeric](38, 2) NULL,
	[prize_first] [numeric](38, 2) NULL,
	[prize_second] [numeric](38, 2) NULL,
	[prize_third] [numeric](38, 2) NULL,
	[image_url] [nvarchar](1000) NULL,
	[referee_id] [int] NULL,
	[entry_fee] [numeric](38, 2) NULL,
	[min_slots] [int] NULL,
	[allowed_classes] [nvarchar](255) NULL,
	[allowed_ages] [nvarchar](255) NULL,
	[allowed_genders] [nvarchar](255) NULL,
	[registration_opening_time] [datetime] NULL,
	[official_race_time] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[upgrade_request_documents]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[upgrade_request_documents](
	[upgrade_request_id] [int] NOT NULL,
	[document_url] [nvarchar](1000) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[upgrade_requests]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[upgrade_requests](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[created_at] [datetime2](6) NULL,
	[notes] [nvarchar](max) NULL,
	[rejection_reason] [nvarchar](max) NULL,
	[requested_role] [varchar](20) NOT NULL,
	[status] [varchar](20) NOT NULL,
	[updated_at] [datetime2](6) NULL,
	[user_id] [int] NOT NULL,
	[certification_number] [varchar](255) NULL,
	[date_of_birth] [date] NULL,
	[experience_years] [int] NULL,
	[full_name] [varchar](255) NULL,
	[height] [float] NULL,
	[identity_number] [varchar](255) NULL,
	[license_number] [varchar](255) NULL,
	[phone_number] [varchar](255) NULL,
	[stable_address] [varchar](255) NULL,
	[stable_name] [varchar](255) NULL,
	[weight] [float] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[user_connections]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[user_connections](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[requester_id] [int] NOT NULL,
	[recipient_id] [int] NOT NULL,
	[status] [nvarchar](20) NOT NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UK7eu4uisnpdfh04pa012x02ots] UNIQUE NONCLUSTERED
(
	[requester_id] ASC,
	[recipient_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_User_Connection] UNIQUE NONCLUSTERED
(
	[requester_id] ASC,
	[recipient_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[users]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[username] [varchar](255) NULL,
	[email] [varchar](255) NULL,
	[password] [varchar](255) NOT NULL,
	[full_name] [nvarchar](255) NULL,
	[phone] [varchar](20) NULL,
	[avatar_url] [varchar](255) NULL,
	[created_at] [datetime2](6) NULL,
	[provider_id] [varchar](255) NULL,
	[updated_at] [datetime2](6) NULL,
	[provider] [varchar](20) NOT NULL,
	[role] [varchar](20) NOT NULL,
	[enabled] [bit] NOT NULL,
	[bank_name] [nvarchar](100) NULL,
	[bank_bin] [varchar](20) NULL,
	[bank_account_number] [varchar](50) NULL,
	[bank_account_holder_name] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED
(
	[username] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[verification_tokens]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[verification_tokens](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[expiry_date] [datetime2](6) NOT NULL,
	[token] [varchar](255) NOT NULL,
	[user_id] [int] NOT NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UK6q9nsb665s9f8qajm3j07kd1e] UNIQUE NONCLUSTERED
(
	[token] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UKdqp95ggn6gvm865km5muba2o5] UNIQUE NONCLUSTERED
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[wallet_transactions]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[wallet_transactions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[wallet_id] [int] NOT NULL,
	[transaction_type] [nvarchar](50) NOT NULL,
	[amount] [decimal](18, 2) NOT NULL,
	[status] [nvarchar](20) NULL,
	[reference_type] [nvarchar](50) NULL,
	[reference_id] [int] NULL,
	[payos_order_code] [bigint] NULL,
	[created_at] [datetime] NULL,
	[bank_name] [nvarchar](100) NULL,
	[bank_bin] [varchar](20) NULL,
	[bank_account_number] [varchar](50) NULL,
	[bank_account_holder_name] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[wallets]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[wallets](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[balance] [decimal](18, 2) NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ai_chat_histories]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ai_chat_histories](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[sender] [nvarchar](10) NOT NULL,
	[message] [nvarchar](max) NOT NULL,
	[created_at] [datetime2](6) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[referee_change_requests]    Script Date: 6/11/2026 2:23:38 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[referee_change_requests](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[referee_id] [int] NOT NULL,
	[tournament_id] [int] NOT NULL,
	[reason] [nvarchar](1000) NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[created_at] [datetime] NULL,
	[updated_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[referee_change_requests] ADD  DEFAULT ('PENDING') FOR [status]
GO
ALTER TABLE [dbo].[referee_change_requests] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[referee_change_requests] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[ban_history] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[bets] ADD  DEFAULT ('PENDING') FOR [status]
GO
ALTER TABLE [dbo].[bets] ADD  DEFAULT ((0)) FOR [payout_amount]
GO
ALTER TABLE [dbo].[bets] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[betting_transactions] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[blacklist] ADD  DEFAULT ((0)) FOR [is_permanent]
GO
ALTER TABLE [dbo].[blacklist] ADD  DEFAULT ('ACTIVE') FOR [status]
GO
ALTER TABLE [dbo].[blacklist] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[chat_messages] ADD  DEFAULT ('USER') FOR [message_type]
GO
ALTER TABLE [dbo].[chat_messages] ADD  DEFAULT ((0)) FOR [is_deleted]
GO
ALTER TABLE [dbo].[chat_messages] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[chat_rooms] ADD  DEFAULT ('ACTIVE') FOR [status]
GO
ALTER TABLE [dbo].[chat_rooms] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[horse_owner_profiles] ADD  DEFAULT ('PENDING') FOR [approval_status]
GO
ALTER TABLE [dbo].[horse_owner_profiles] ADD  DEFAULT ((5.0)) FOR [reputation_stars]
GO
ALTER TABLE [dbo].[horses] ADD  DEFAULT ((100)) FOR [stamina_rating]
GO
ALTER TABLE [dbo].[horses] ADD  DEFAULT ((100)) FOR [gate_performance_rating]
GO
ALTER TABLE [dbo].[jockey_agreements] ADD  DEFAULT ('Pending') FOR [status]
GO
ALTER TABLE [dbo].[jockey_agreements] ADD  DEFAULT (getdate()) FOR [sent_at]
GO
ALTER TABLE [dbo].[jockey_profiles] ADD  DEFAULT ((0)) FOR [win_rate]
GO
ALTER TABLE [dbo].[jockey_profiles] ADD  DEFAULT ((0)) FOR [experience_year]
GO
ALTER TABLE [dbo].[jockey_profiles] ADD  DEFAULT ((0)) FOR [ranking_score]
GO
ALTER TABLE [dbo].[jockey_profiles] ADD  DEFAULT ('Pending') FOR [approval_status]
GO
ALTER TABLE [dbo].[jockey_profiles] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT ('GENERAL') FOR [type]
GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT ((0)) FOR [is_read]
GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[prize_distributions] ADD  DEFAULT ('PENDING') FOR [status]
GO
ALTER TABLE [dbo].[prize_distributions] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[race_participants] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[race_registrations] ADD  DEFAULT ('Registered') FOR [status]
GO
ALTER TABLE [dbo].[race_registrations] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[race_simulations] ADD  DEFAULT ((0)) FOR [current_tick]
GO
ALTER TABLE [dbo].[race_simulations] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[referee_flags] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[role_upgrade_requests] ADD  DEFAULT ('Pending') FOR [status]
GO
ALTER TABLE [dbo].[role_upgrade_requests] ADD  DEFAULT (getdate()) FOR [submitted_at]
GO
ALTER TABLE [dbo].[simulation_horse_states] ADD  DEFAULT ((0)) FOR [current_position]
GO
ALTER TABLE [dbo].[simulation_horse_states] ADD  DEFAULT ((0)) FOR [speed]
GO
ALTER TABLE [dbo].[simulation_horse_states] ADD  DEFAULT ((0)) FOR [acceleration]
GO
ALTER TABLE [dbo].[simulation_horse_states] ADD  DEFAULT ((100)) FOR [stamina]
GO
ALTER TABLE [dbo].[simulation_horse_states] ADD  DEFAULT (getdate()) FOR [last_updated_at]
GO
ALTER TABLE [dbo].[tournaments] ADD  DEFAULT ((0)) FOR [total_prize]
GO
ALTER TABLE [dbo].[tournaments] ADD  DEFAULT ('Upcoming') FOR [tournament_status]
GO
ALTER TABLE [dbo].[tournaments] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[user_connections] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ('LOCAL') FOR [provider]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ('SPECTATOR') FOR [role]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ((1)) FOR [enabled]
GO
ALTER TABLE [dbo].[wallet_transactions] ADD  DEFAULT ('SUCCESS') FOR [status]
GO
ALTER TABLE [dbo].[wallet_transactions] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[wallets] ADD  DEFAULT ((0)) FOR [balance]
GO
ALTER TABLE [dbo].[wallets] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[ban_history]  WITH CHECK ADD FOREIGN KEY([action_by])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[ban_history]  WITH CHECK ADD FOREIGN KEY([blacklist_id])
REFERENCES [dbo].[blacklist] ([id])
GO
ALTER TABLE [dbo].[bets]  WITH CHECK ADD FOREIGN KEY([participant_id])
REFERENCES [dbo].[race_participants] ([id])
GO
ALTER TABLE [dbo].[bets]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[bets]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[betting_transactions]  WITH CHECK ADD FOREIGN KEY([bet_id])
REFERENCES [dbo].[bets] ([id])
GO
ALTER TABLE [dbo].[betting_transactions]  WITH CHECK ADD FOREIGN KEY([wallet_transaction_id])
REFERENCES [dbo].[wallet_transactions] ([id])
GO
ALTER TABLE [dbo].[chat_messages]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[chat_rooms] ([id])
GO
ALTER TABLE [dbo].[chat_messages]  WITH CHECK ADD FOREIGN KEY([sender_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[chat_rooms]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[horse_owner_profiles]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[horses]  WITH CHECK ADD FOREIGN KEY([breed_id])
REFERENCES [dbo].[horse_breeds] ([id])
GO
ALTER TABLE [dbo].[horses]  WITH CHECK ADD FOREIGN KEY([owner_id])
REFERENCES [dbo].[horse_owner_profiles] ([id])
GO
ALTER TABLE [dbo].[jockey_agreements]  WITH CHECK ADD  CONSTRAINT [FK_jockey_agreements_jockey] FOREIGN KEY([jockey_id])
REFERENCES [dbo].[jockey_profiles] ([id])
GO
ALTER TABLE [dbo].[jockey_agreements] CHECK CONSTRAINT [FK_jockey_agreements_jockey]
GO
ALTER TABLE [dbo].[jockey_agreements]  WITH CHECK ADD  CONSTRAINT [FK_jockey_agreements_owner] FOREIGN KEY([owner_id])
REFERENCES [dbo].[horse_owner_profiles] ([id])
GO
ALTER TABLE [dbo].[jockey_agreements] CHECK CONSTRAINT [FK_jockey_agreements_owner]
GO
ALTER TABLE [dbo].[jockey_profiles]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[notifications]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[password_reset_tokens]  WITH CHECK ADD  CONSTRAINT [FKk3ndxg5xp6v7wd4gjyusp15gq] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[password_reset_tokens] CHECK CONSTRAINT [FKk3ndxg5xp6v7wd4gjyusp15gq]
GO
ALTER TABLE [dbo].[prize_distributions]  WITH CHECK ADD FOREIGN KEY([participant_id])
REFERENCES [dbo].[race_participants] ([id])
GO
ALTER TABLE [dbo].[race_participants]  WITH CHECK ADD FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[race_participants]  WITH CHECK ADD FOREIGN KEY([jockey_id])
REFERENCES [dbo].[jockey_profiles] ([id])
GO
ALTER TABLE [dbo].[race_participants]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_horse] FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_horse]
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_jockey] FOREIGN KEY([jockey_id])
REFERENCES [dbo].[jockey_profiles] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_jockey]
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_owner] FOREIGN KEY([owner_id])
REFERENCES [dbo].[horse_owner_profiles] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_owner]
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_race] FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_race]
GO
ALTER TABLE [dbo].[race_simulations]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_simulations]  WITH CHECK ADD  CONSTRAINT [FK_simulation_race] FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_simulations] CHECK CONSTRAINT [FK_simulation_race]
GO
ALTER TABLE [dbo].[races]  WITH CHECK ADD FOREIGN KEY([race_track_id])
REFERENCES [dbo].[race_tracks] ([id])
GO
ALTER TABLE [dbo].[races]  WITH CHECK ADD FOREIGN KEY([tournament_id])
REFERENCES [dbo].[tournaments] ([id])
GO
ALTER TABLE [dbo].[referee_flags]  WITH CHECK ADD FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[referee_flags]  WITH CHECK ADD FOREIGN KEY([referee_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[referee_flags]  WITH CHECK ADD FOREIGN KEY([simulation_id])
REFERENCES [dbo].[race_simulations] ([id])
GO
ALTER TABLE [dbo].[refresh_tokens]  WITH CHECK ADD  CONSTRAINT [FK1lih5y2npsf8u5o3vhdb9y0os] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[refresh_tokens] CHECK CONSTRAINT [FK1lih5y2npsf8u5o3vhdb9y0os]
GO
ALTER TABLE [dbo].[role_upgrade_requests]  WITH CHECK ADD FOREIGN KEY([requested_role_id])
REFERENCES [dbo].[roles] ([id])
GO
ALTER TABLE [dbo].[role_upgrade_requests]  WITH CHECK ADD FOREIGN KEY([reviewed_by])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[role_upgrade_requests]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[simulation_horse_states]  WITH CHECK ADD FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[simulation_horse_states]  WITH CHECK ADD FOREIGN KEY([simulation_id])
REFERENCES [dbo].[race_simulations] ([id])
GO
ALTER TABLE [dbo].[upgrade_request_documents]  WITH CHECK ADD  CONSTRAINT [FKffj0otohe52eiahcbcg5hwgqp] FOREIGN KEY([upgrade_request_id])
REFERENCES [dbo].[upgrade_requests] ([id])
GO
ALTER TABLE [dbo].[upgrade_request_documents] CHECK CONSTRAINT [FKffj0otohe52eiahcbcg5hwgqp]
GO
ALTER TABLE [dbo].[upgrade_requests]  WITH CHECK ADD  CONSTRAINT [FK4k81tfrqofqiyecqios0uowox] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[upgrade_requests] CHECK CONSTRAINT [FK4k81tfrqofqiyecqios0uowox]
GO
ALTER TABLE [dbo].[user_connections]  WITH CHECK ADD FOREIGN KEY([recipient_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[user_connections]  WITH CHECK ADD FOREIGN KEY([requester_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[verification_tokens]  WITH CHECK ADD  CONSTRAINT [FK54y8mqsnq1rtyf581sfmrbp4f] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[verification_tokens] CHECK CONSTRAINT [FK54y8mqsnq1rtyf581sfmrbp4f]
GO
ALTER TABLE [dbo].[wallet_transactions]  WITH CHECK ADD FOREIGN KEY([wallet_id])
REFERENCES [dbo].[wallets] ([id])
GO
ALTER TABLE [dbo].[wallets]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[ai_chat_histories]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[referee_change_requests]  WITH CHECK ADD FOREIGN KEY([referee_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[referee_change_requests]  WITH CHECK ADD FOREIGN KEY([tournament_id])
REFERENCES [dbo].[tournaments] ([id])
GO
ALTER TABLE [dbo].[referee_change_requests]  WITH CHECK ADD CHECK  (([status]='REJECTED' OR [status]='APPROVED' OR [status]='PENDING'))
GO
ALTER TABLE [dbo].[upgrade_requests]  WITH CHECK ADD CHECK  (([requested_role]='ADMIN' OR [requested_role]='RACE_REFEREE' OR [requested_role]='JOCKEY' OR [requested_role]='HORSE_OWNER' OR [requested_role]='SPECTATOR'))
GO
ALTER TABLE [dbo].[upgrade_requests]  WITH CHECK ADD CHECK  (([status]='REJECTED' OR [status]='APPROVED' OR [status]='PENDING'))
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD CHECK  (([provider]='GOOGLE' OR [provider]='LOCAL'))
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD CHECK  (([role]='ADMIN' OR [role]='RACE_REFEREE' OR [role]='JOCKEY' OR [role]='HORSE_OWNER' OR [role]='SPECTATOR'))
GO
-- ==========================================
-- TEST DATA FOR FE TESTING
-- ==========================================
USE [HorseRacingDB]
GO

ALTER TABLE [dbo].[betting_transactions]  WITH CHECK ADD FOREIGN KEY([wallet_transaction_id])
REFERENCES [dbo].[wallet_transactions] ([id])
GO
ALTER TABLE [dbo].[chat_messages]  WITH CHECK ADD FOREIGN KEY([room_id])
REFERENCES [dbo].[chat_rooms] ([id])
GO
ALTER TABLE [dbo].[chat_messages]  WITH CHECK ADD FOREIGN KEY([sender_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[chat_rooms]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[horse_owner_profiles]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[horses]  WITH CHECK ADD FOREIGN KEY([breed_id])
REFERENCES [dbo].[horse_breeds] ([id])
GO
ALTER TABLE [dbo].[horses]  WITH CHECK ADD FOREIGN KEY([owner_id])
REFERENCES [dbo].[horse_owner_profiles] ([id])
GO
ALTER TABLE [dbo].[jockey_agreements]  WITH CHECK ADD  CONSTRAINT [FK_jockey_agreements_jockey] FOREIGN KEY([jockey_id])
REFERENCES [dbo].[jockey_profiles] ([id])
GO
ALTER TABLE [dbo].[jockey_agreements] CHECK CONSTRAINT [FK_jockey_agreements_jockey]
GO
ALTER TABLE [dbo].[jockey_agreements]  WITH CHECK ADD  CONSTRAINT [FK_jockey_agreements_owner] FOREIGN KEY([owner_id])
REFERENCES [dbo].[horse_owner_profiles] ([id])
GO
ALTER TABLE [dbo].[jockey_agreements] CHECK CONSTRAINT [FK_jockey_agreements_owner]
GO
ALTER TABLE [dbo].[jockey_profiles]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[notifications]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[password_reset_tokens]  WITH CHECK ADD  CONSTRAINT [FKk3ndxg5xp6v7wd4gjyusp15gq] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[password_reset_tokens] CHECK CONSTRAINT [FKk3ndxg5xp6v7wd4gjyusp15gq]
GO
ALTER TABLE [dbo].[prize_distributions]  WITH CHECK ADD FOREIGN KEY([participant_id])
REFERENCES [dbo].[race_participants] ([id])
GO
ALTER TABLE [dbo].[race_participants]  WITH CHECK ADD FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[race_participants]  WITH CHECK ADD FOREIGN KEY([jockey_id])
REFERENCES [dbo].[jockey_profiles] ([id])
GO
ALTER TABLE [dbo].[race_participants]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_horse] FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_horse]
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_jockey] FOREIGN KEY([jockey_id])
REFERENCES [dbo].[jockey_profiles] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_jockey]
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_owner] FOREIGN KEY([owner_id])
REFERENCES [dbo].[horse_owner_profiles] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_owner]
GO
ALTER TABLE [dbo].[race_registrations]  WITH CHECK ADD  CONSTRAINT [FK_race_registrations_race] FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_registrations] CHECK CONSTRAINT [FK_race_registrations_race]
GO
ALTER TABLE [dbo].[race_simulations]  WITH CHECK ADD FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_simulations]  WITH CHECK ADD  CONSTRAINT [FK_simulation_race] FOREIGN KEY([race_id])
REFERENCES [dbo].[races] ([id])
GO
ALTER TABLE [dbo].[race_simulations] CHECK CONSTRAINT [FK_simulation_race]
GO
ALTER TABLE [dbo].[races]  WITH CHECK ADD FOREIGN KEY([race_track_id])
REFERENCES [dbo].[race_tracks] ([id])
GO
ALTER TABLE [dbo].[races]  WITH CHECK ADD FOREIGN KEY([tournament_id])
REFERENCES [dbo].[tournaments] ([id])
GO
ALTER TABLE [dbo].[referee_flags]  WITH CHECK ADD FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[referee_flags]  WITH CHECK ADD FOREIGN KEY([referee_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[referee_flags]  WITH CHECK ADD FOREIGN KEY([simulation_id])
REFERENCES [dbo].[race_simulations] ([id])
GO
ALTER TABLE [dbo].[refresh_tokens]  WITH CHECK ADD  CONSTRAINT [FK1lih5y2npsf8u5o3vhdb9y0os] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[refresh_tokens] CHECK CONSTRAINT [FK1lih5y2npsf8u5o3vhdb9y0os]
GO
ALTER TABLE [dbo].[role_upgrade_requests]  WITH CHECK ADD FOREIGN KEY([requested_role_id])
REFERENCES [dbo].[roles] ([id])
GO
ALTER TABLE [dbo].[role_upgrade_requests]  WITH CHECK ADD FOREIGN KEY([reviewed_by])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[role_upgrade_requests]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[simulation_horse_states]  WITH CHECK ADD FOREIGN KEY([horse_id])
REFERENCES [dbo].[horses] ([id])
GO
ALTER TABLE [dbo].[simulation_horse_states]  WITH CHECK ADD FOREIGN KEY([simulation_id])
REFERENCES [dbo].[race_simulations] ([id])
GO
ALTER TABLE [dbo].[upgrade_request_documents]  WITH CHECK ADD  CONSTRAINT [FKffj0otohe52eiahcbcg5hwgqp] FOREIGN KEY([upgrade_request_id])
REFERENCES [dbo].[upgrade_requests] ([id])
GO
ALTER TABLE [dbo].[upgrade_request_documents] CHECK CONSTRAINT [FKffj0otohe52eiahcbcg5hwgqp]
GO
ALTER TABLE [dbo].[upgrade_requests]  WITH CHECK ADD  CONSTRAINT [FK4k81tfrqofqiyecqios0uowox] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[upgrade_requests] CHECK CONSTRAINT [FK4k81tfrqofqiyecqios0uowox]
GO
ALTER TABLE [dbo].[user_connections]  WITH CHECK ADD FOREIGN KEY([recipient_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[user_connections]  WITH CHECK ADD FOREIGN KEY([requester_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[verification_tokens]  WITH CHECK ADD  CONSTRAINT [FK54y8mqsnq1rtyf581sfmrbp4f] FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[verification_tokens] CHECK CONSTRAINT [FK54y8mqsnq1rtyf581sfmrbp4f]
GO
ALTER TABLE [dbo].[wallet_transactions]  WITH CHECK ADD FOREIGN KEY([wallet_id])
REFERENCES [dbo].[wallets] ([id])
GO
ALTER TABLE [dbo].[wallets]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[tournaments]  WITH CHECK ADD  CONSTRAINT [FK_tournaments_referee] FOREIGN KEY([referee_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[tournaments] CHECK CONSTRAINT [FK_tournaments_referee]
GO
ALTER TABLE [dbo].[races]  WITH CHECK ADD  CONSTRAINT [FK_races_referee] FOREIGN KEY([referee_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[races] CHECK CONSTRAINT [FK_races_referee]
GO
ALTER TABLE [dbo].[upgrade_requests]  WITH CHECK ADD CHECK  (([requested_role]='ADMIN' OR [requested_role]='RACE_REFEREE' OR [requested_role]='JOCKEY' OR [requested_role]='HORSE_OWNER' OR [requested_role]='SPECTATOR'))
GO
ALTER TABLE [dbo].[upgrade_requests]  WITH CHECK ADD CHECK  (([status]='REJECTED' OR [status]='APPROVED' OR [status]='PENDING'))
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD CHECK  (([provider]='GOOGLE' OR [provider]='LOCAL'))
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD CHECK  (([role]='ADMIN' OR [role]='RACE_REFEREE' OR [role]='JOCKEY' OR [role]='HORSE_OWNER' OR [role]='SPECTATOR'))
GO
-- ==========================================
-- TEST DATA FOR FE TESTING
-- ==========================================
USE [HorseRacingDB]
GO

-- 1. Insert Roles
INSERT INTO [dbo].[roles] ([role_name], [description]) VALUES
('ADMIN', 'System Administrator'),
('SPECTATOR', 'Normal User'),
('HORSE_OWNER', 'Horse Owner'),
('JOCKEY', 'Jockey'),
('RACE_REFEREE', 'Race Referee');
GO

-- 2. Insert Users (Password for all non-admin accounts: SlimeTempest@2026, Admin password: Admin@12345)
INSERT INTO [dbo].[users] ([username], [email], [password], [full_name], [phone], [provider], [role], [enabled]) VALUES
('admin', 'admin@gmail.com', '$2a$10$O2bhOwtxrJ8epZ3Meq4w4uyYwPDBeoMaQOfasG9XdrGrhvpQztp/.', 'System Administrator', '0901000001', 'LOCAL', 'ADMIN', 1),

('shuna', 'shuna@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Shuna Princess', '0901000002', 'LOCAL', 'SPECTATOR', 1),
('shion', 'shion@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Shion Greatmaster', '0901000003', 'LOCAL', 'SPECTATOR', 1),
('milim', 'milim.nava@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Milim Nava', '0901000004', 'LOCAL', 'SPECTATOR', 1),
('ramiris', 'ramiris@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Ramiris Fairy', '0901000005', 'LOCAL', 'SPECTATOR', 1),
('treyni', 'treyni@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Treyni Dryad', '0901000006', 'LOCAL', 'SPECTATOR', 1),
('trya', 'trya@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Trya Dryad', '0901000007', 'LOCAL', 'SPECTATOR', 1),
('dreyfus', 'dreyfus@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Dreyfus Knight', '0901000008', 'LOCAL', 'SPECTATOR', 1),
('myourmiles', 'myourmiles@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Myourmiles Merchant', '0901000009', 'LOCAL', 'SPECTATOR', 1),

('benimaru', 'benimaru@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Benimaru Commander', '0901000010', 'LOCAL', 'HORSE_OWNER', 1),
('souei', 'souei@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Souei Shadow', '0901000011', 'LOCAL', 'HORSE_OWNER', 1),
('hakuro', 'hakuro@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Hakuro Swordsman', '0901000012', 'LOCAL', 'HORSE_OWNER', 1),
('geld', 'geld@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Geld Orc King', '0901000013', 'LOCAL', 'HORSE_OWNER', 1),
('gabil', 'gabil@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Gabil Dragonewt', '0901000014', 'LOCAL', 'HORSE_OWNER', 1),
('rigurd', 'rigurd@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Rigurd Goblin Prime', '0901000015', 'LOCAL', 'HORSE_OWNER', 1),
('gobta', 'gobta@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Gobta Rider', '0901000016', 'LOCAL', 'HORSE_OWNER', 1),
('kaijin', 'kaijin@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Kaijin Craftsman', '0901000017', 'LOCAL', 'HORSE_OWNER', 1),

('ranga', 'ranga@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Ranga Star Wolf', '0901000018', 'LOCAL', 'JOCKEY', 1),
('beretta', 'beretta@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Beretta Golem', '0901000019', 'LOCAL', 'JOCKEY', 1),
('diablo', 'diablo@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Diablo Black Primordial', '0901000020', 'LOCAL', 'JOCKEY', 1),
('carrion', 'carrion@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Carrion Beast King', '0901000021', 'LOCAL', 'JOCKEY', 1),
('phobio', 'phobio@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Phobio Panther', '0901000022', 'LOCAL', 'JOCKEY', 1),
('suphia', 'suphia@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Suphia Tiger', '0901000023', 'LOCAL', 'JOCKEY', 1),
('albis', 'albis@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Albis Serpent', '0901000024', 'LOCAL', 'JOCKEY', 1),
('grucius', 'grucius@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Grucius Werewolf', '0901000025', 'LOCAL', 'JOCKEY', 1),

('guy_crimson', 'guy.crimson@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Guy Crimson', '0901000026', 'LOCAL', 'RACE_REFEREE', 1),
('velgrynd', 'velgrynd@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Velgrynd Dragon', '0901000027', 'LOCAL', 'RACE_REFEREE', 1),
('velzard', 'velzard@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Velzard Dragon', '0901000028', 'LOCAL', 'RACE_REFEREE', 1),
('luminous', 'luminous@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Luminous Valentine', '0901000029', 'LOCAL', 'RACE_REFEREE', 1),
('dagruel', 'dagruel@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Dagruel Giant', '0901000030', 'LOCAL', 'RACE_REFEREE', 1),
('dino', 'dino@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Dino Fallen Angel', '0901000031', 'LOCAL', 'RACE_REFEREE', 1),
('leon_cromwell', 'leon.cromwell@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Leon Cromwell', '0901000032', 'LOCAL', 'RACE_REFEREE', 1),
('elmesia', 'elmesia@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Elmesia El-Ru Thaliad', '0901000033', 'LOCAL', 'RACE_REFEREE', 1),

('clayman', 'clayman@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Clayman Marionette', '0901000034', 'LOCAL', 'SPECTATOR', 1),
('footman', 'footman@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Footman Clown', '0901000035', 'LOCAL', 'SPECTATOR', 1),
('laplace', 'laplace@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Laplace Clown', '0901000036', 'LOCAL', 'SPECTATOR', 1),

('kurobe', 'kurobe@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Kurobe Smith', '0901000037', 'LOCAL', 'SPECTATOR', 1),
('sooka', 'sooka@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Sooka Dragonewt', '0901000038', 'LOCAL', 'SPECTATOR', 1),
('yamato', 'yamato@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Yamato General', '0901000039', 'LOCAL', 'SPECTATOR', 1),
('takuya', 'takuya@tempest.com', '$2a$10$pr8Z1G6oodLUpWSKA7AOMugY16Vcq6R9iDFhaXC1y0rILBHr0r4Yq', 'Takuya Ninja', '0901000040', 'LOCAL', 'SPECTATOR', 1);
GO

-- 3. Insert Owner & Jockey Profiles
INSERT INTO [dbo].[horse_owner_profiles] ([user_id], [stable_name], [stable_address], [phone], [identity_number], [date_of_birth], [bank_account], [description], [reputation_stars], [approval_status]) VALUES
((SELECT id FROM [users] WHERE username='benimaru'), N'Benimaru Stables', N'East District, Tempest City', '0901000010', '038090100010', '1995-05-15', '9704123456789010', N'Top racing stables in Tempest Federation', 5.0, 'APPROVED'),
((SELECT id FROM [users] WHERE username='souei'), N'Souei Stables', N'West District, Tempest City', '0901000011', '038090100011', '1996-08-20', '9704123456789011', N'High-speed racing horse training experts', 5.0, 'APPROVED'),
((SELECT id FROM [users] WHERE username='hakuro'), N'Hakuro Stables', N'South District, Tempest City', '0901000012', '038090100012', '1985-03-10', '9704123456789012', N'Prestigious ranch with legendary thoroughbreds', 5.0, 'APPROVED'),
((SELECT id FROM [users] WHERE username='geld'), N'Geld Stables', N'North District, Tempest City', '0901000013', '038090100013', '1990-11-25', '9704123456789013', N'Endurance horse racing specialists', 5.0, 'APPROVED'),
((SELECT id FROM [users] WHERE username='gabil'), N'Gabil Stables', N'Dragon Shrine Lake District, Tempest', '0901000014', '038090100014', '1997-02-14', '9704123456789014', N'Unique Dragonewt style racing stables', 5.0, 'APPROVED'),
((SELECT id FROM [users] WHERE username='rigurd'), N'Rigurd Stables', N'City Center, Tempest', '0901000015', '038090100015', '1980-07-04', '9704123456789015', N'The oldest established ranch in Tempest', 5.0, 'APPROVED'),
((SELECT id FROM [users] WHERE username='gobta'), N'Gobta Stables', N'Outskirts, Tempest City', '0901000016', '038090100016', '1999-09-09', '9704123456789016', N'Promising young horse stables', 5.0, 'APPROVED'),
((SELECT id FROM [users] WHERE username='kaijin'), N'Kaijin Stables', N'Craftsman District, Tempest', '0901000017', '038090100017', '1988-12-12', '9704123456789017', N'Ranch combining modern tech and craftsmanship', 5.0, 'APPROVED');
GO

INSERT INTO [dbo].[jockey_profiles] ([user_id], [height], [weight], [win_rate], [experience_year], [ranking_score], [license_number], [bank_account], [approval_status]) VALUES
((SELECT id FROM [users] WHERE username='ranga'), 168.0, 52.0, 45.5, 5, 1350, 'JCK-TEMPEST-01', '970488880001', 'APPROVED'),
((SELECT id FROM [users] WHERE username='beretta'), 170.0, 54.0, 52.0, 6, 1420, 'JCK-TEMPEST-02', '970488880002', 'APPROVED'),
((SELECT id FROM [users] WHERE username='diablo'), 175.0, 55.0, 68.0, 8, 1600, 'JCK-TEMPEST-03', '970488880003', 'APPROVED'),
((SELECT id FROM [users] WHERE username='carrion'), 172.0, 53.0, 38.0, 4, 1180, 'JCK-TEMPEST-04', '970488880004', 'APPROVED'),
((SELECT id FROM [users] WHERE username='phobio'), 166.0, 51.0, 42.0, 3, 1220, 'JCK-TEMPEST-05', '970488880005', 'APPROVED'),
((SELECT id FROM [users] WHERE username='suphia'), 167.0, 50.0, 50.0, 5, 1380, 'JCK-TEMPEST-06', '970488880006', 'APPROVED'),
((SELECT id FROM [users] WHERE username='albis'), 169.0, 52.0, 60.0, 7, 1500, 'JCK-TEMPEST-07', '970488880007', 'APPROVED'),
((SELECT id FROM [users] WHERE username='grucius'), 171.0, 53.0, 35.0, 3, 1100, 'JCK-TEMPEST-08', '970488880008', 'APPROVED');
GO

-- 4. Insert Horse Breeds
INSERT INTO [dbo].[horse_breeds] ([breed_name]) VALUES
('Thoroughbred'), ('Arabian'), ('Quarter Horse'), ('Appaloosa');
GO

-- 5. Insert Horses (8 horses per owner * 8 owners = 64 horses)
INSERT INTO [dbo].[horses] ([owner_id], [breed_id], [name], [age], [gender], [training_status], [health_status], [status], [speed_rating], [stamina_rating], [gate_performance_rating], [color]) VALUES
-- Owner 1 (Benimaru)
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='benimaru')), 1, 'Veldora', 4, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 95.0, 90, 88, 'Bay'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='benimaru')), 2, N'Xích Hỏa', 5, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 88.0, 85, 82, 'Chestnut'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='benimaru')), 3, N'Hồng Liên', 3, 'FEMALE', 'IN_PROGRESS', 'GOOD', 'ACTIVE', 75.0, 70, 75, 'Black'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='benimaru')), 4, N'Bạch Viêm', 6, 'MALE', 'COMPLETED', 'FAIR', 'RESTING', 82.0, 80, 78, 'White'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='benimaru')), 1, N'Hỏa Long', 4, 'FEMALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 90.0, 88, 85, 'Palomino'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='benimaru')), 2, N'Tân Viêm', 3, 'MALE', 'NOT_STARTED', 'EXCELLENT', 'ACTIVE', NULL, NULL, NULL, 'Gray'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='benimaru')), 3, N'Hỏa Ảnh', 7, 'FEMALE', 'COMPLETED', 'INJURED', 'INJURED', 70.0, 65, 60, 'Roan'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='benimaru')), 4, N'Hỏa Sâm', 3, 'FEMALE', 'NOT_STARTED', 'GOOD', 'ACTIVE', NULL, NULL, NULL, 'Brown'),

-- Owner 2 (Souei)
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='souei')), 1, N'Ảnh Ma', 5, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 94.0, 92, 90, 'Black'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='souei')), 2, N'Tật Phong', 4, 'FEMALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 89.0, 86, 84, 'Gray'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='souei')), 3, N'Dạ Ảnh', 6, 'MALE', 'COMPLETED', 'FAIR', 'RESTING', 80.0, 78, 75, 'Chestnut'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='souei')), 4, N'U Hồn', 3, 'FEMALE', 'IN_PROGRESS', 'GOOD', 'ACTIVE', 72.0, 70, 72, 'White'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='souei')), 1, N'Tàn Ảnh', 4, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 86.0, 84, 80, 'Bay'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='souei')), 2, N'Ẩn Ảnh', 3, 'FEMALE', 'NOT_STARTED', 'EXCELLENT', 'ACTIVE', NULL, NULL, NULL, 'Brown'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='souei')), 3, N'Lôi Ảnh', 5, 'MALE', 'COMPLETED', 'INJURED', 'INJURED', 78.0, 75, 70, 'Roan'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='souei')), 4, N'Phong Ảnh', 3, 'MALE', 'NOT_STARTED', 'GOOD', 'ACTIVE', NULL, NULL, NULL, 'Palomino'),

-- Owner 3 (Hakuro)
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='hakuro')), 1, N'Kiếm Thánh', 6, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 96.0, 94, 92, 'White'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='hakuro')), 2, N'Thiên Nhất', 5, 'FEMALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 91.0, 88, 86, 'Bay'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='hakuro')), 3, N'Lôi Thần', 4, 'MALE', 'IN_PROGRESS', 'GOOD', 'ACTIVE', 83.0, 80, 78, 'Chestnut'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='hakuro')), 4, N'Nhất Đao', 7, 'MALE', 'COMPLETED', 'FAIR', 'RESTING', 79.0, 76, 74, 'Gray'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='hakuro')), 1, N'Truy Nhượng', 4, 'FEMALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 87.0, 85, 82, 'Black'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='hakuro')), 2, N'Kiếm Ảnh', 3, 'MALE', 'NOT_STARTED', 'EXCELLENT', 'ACTIVE', NULL, NULL, NULL, 'Roan'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='hakuro')), 3, N'Phần Thiên', 5, 'FEMALE', 'COMPLETED', 'INJURED', 'INJURED', 74.0, 70, 68, 'Palomino'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='hakuro')), 4, N'Tân Kiếm', 3, 'FEMALE', 'NOT_STARTED', 'GOOD', 'ACTIVE', NULL, NULL, NULL, 'Brown'),

-- Owner 4 (Geld)
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='geld')), 1, N'Ngang Tàng', 5, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 90.0, 96, 85, 'Chestnut'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='geld')), 2, N'Bá Vương', 6, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 88.0, 92, 82, 'Black'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='geld')), 3, N'Thiên Giáp', 4, 'FEMALE', 'IN_PROGRESS', 'GOOD', 'ACTIVE', 82.0, 86, 78, 'Bay'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='geld')), 4, N'Thiên Thạch', 7, 'MALE', 'COMPLETED', 'FAIR', 'RESTING', 76.0, 82, 72, 'Gray'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='geld')), 1, N'Kình Lực', 4, 'FEMALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 85.0, 90, 80, 'Roan'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='geld')), 2, N'Trùng Sinh', 3, 'MALE', 'NOT_STARTED', 'EXCELLENT', 'ACTIVE', NULL, NULL, NULL, 'White'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='geld')), 3, N'Bản Thạch', 5, 'FEMALE', 'COMPLETED', 'INJURED', 'INJURED', 72.0, 78, 66, 'Brown'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='geld')), 4, N'Khôi Giáp', 3, 'FEMALE', 'NOT_STARTED', 'GOOD', 'ACTIVE', NULL, NULL, NULL, 'Palomino'),

-- Owner 5 (Gabil)
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gabil')), 1, N'Hồng Long', 4, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 92.0, 89, 87, 'Bay'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gabil')), 2, 'Phi Long', 5, 'FEMALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 87.0, 85, 83, 'Chestnut'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gabil')), 3, N'Thùy Long', 6, 'MALE', 'IN_PROGRESS', 'GOOD', 'ACTIVE', 81.0, 79, 76, 'Gray'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gabil')), 4, 'Thanh Long', 7, 'FEMALE', 'COMPLETED', 'FAIR', 'RESTING', 77.0, 74, 70, 'Black'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gabil')), 1, N'Xích Long', 4, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 84.0, 82, 79, 'Roan'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gabil')), 2, N'Tân Long', 3, 'FEMALE', 'NOT_STARTED', 'EXCELLENT', 'ACTIVE', NULL, NULL, NULL, 'Palomino'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gabil')), 3, N'Bá Long', 5, 'MALE', 'COMPLETED', 'INJURED', 'INJURED', 73.0, 71, 67, 'White'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gabil')), 4, N'Vũ Long', 3, 'MALE', 'NOT_STARTED', 'GOOD', 'ACTIVE', NULL, NULL, NULL, 'Brown'),

-- Owner 6 (Rigurd)
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='rigurd')), 1, N'Tiên Phong', 5, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 89.0, 88, 86, 'Bay'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='rigurd')), 2, N'Lãnh Đạo', 6, 'FEMALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 86.0, 84, 82, 'Black'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='rigurd')), 3, N'Trân Thú', 4, 'MALE', 'IN_PROGRESS', 'GOOD', 'ACTIVE', 80.0, 78, 75, 'Chestnut'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='rigurd')), 4, 'Quang Vinh', 7, 'FEMALE', 'COMPLETED', 'FAIR', 'RESTING', 75.0, 72, 68, 'Gray'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='rigurd')), 1, N'Huy Hoàng', 4, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 83.0, 81, 77, 'White'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='rigurd')), 2, N'Tân Binh', 3, 'FEMALE', 'NOT_STARTED', 'EXCELLENT', 'ACTIVE', NULL, NULL, NULL, 'Brown'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='rigurd')), 3, N'Vệ Binh', 5, 'MALE', 'COMPLETED', 'INJURED', 'INJURED', 71.0, 69, 65, 'Roan'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='rigurd')), 4, N'Thiên Binh', 3, 'FEMALE', 'NOT_STARTED', 'GOOD', 'ACTIVE', NULL, NULL, NULL, 'Palomino'),

-- Owner 7 (Gobta)
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gobta')), 1, 'Lan Nha', 4, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 93.0, 91, 89, 'Black'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gobta')), 2, N'Cực Phong', 5, 'FEMALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 88.0, 86, 84, 'Gray'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gobta')), 3, N'Tốc Độ', 3, 'MALE', 'IN_PROGRESS', 'GOOD', 'ACTIVE', 82.0, 79, 77, 'Bay'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gobta')), 4, N'Thần Phong', 6, 'FEMALE', 'COMPLETED', 'FAIR', 'RESTING', 78.0, 75, 71, 'Chestnut'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gobta')), 1, N'Bão Tuyết', 4, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 85.0, 83, 80, 'White'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gobta')), 2, N'Bạch Nha', 3, 'FEMALE', 'NOT_STARTED', 'EXCELLENT', 'ACTIVE', NULL, NULL, NULL, 'Palomino'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gobta')), 3, N'Hắc Nha', 5, 'MALE', 'COMPLETED', 'INJURED', 'INJURED', 73.0, 70, 66, 'Brown'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='gobta')), 4, N'Bát Phong', 3, 'MALE', 'NOT_STARTED', 'GOOD', 'ACTIVE', NULL, NULL, NULL, 'Roan'),

-- Owner 8 (Kaijin)
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='kaijin')), 1, N'Hợp Kim', 5, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 91.0, 90, 88, 'Gray'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='kaijin')), 2, N'Thần Khí', 6, 'FEMALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 87.0, 85, 83, 'Chestnut'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='kaijin')), 3, N'Hỏa Lô', 4, 'MALE', 'IN_PROGRESS', 'GOOD', 'ACTIVE', 81.0, 78, 76, 'Bay'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='kaijin')), 4, N'Thép Tinh', 7, 'FEMALE', 'COMPLETED', 'FAIR', 'RESTING', 77.0, 74, 70, 'Black'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='kaijin')), 1, N'Kim Cương', 4, 'MALE', 'COMPLETED', 'EXCELLENT', 'ACTIVE', 84.0, 82, 79, 'White'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='kaijin')), 2, N'Bảo Kiếm', 3, 'FEMALE', 'NOT_STARTED', 'EXCELLENT', 'ACTIVE', NULL, NULL, NULL, 'Palomino'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='kaijin')), 3, N'Giáp Thiết', 5, 'MALE', 'COMPLETED', 'INJURED', 'INJURED', 72.0, 68, 64, 'Roan'),
((SELECT id FROM [horse_owner_profiles] WHERE user_id=(SELECT id FROM [users] WHERE username='kaijin')), 4, N'Luyện Kim', 3, 'FEMALE', 'NOT_STARTED', 'GOOD', 'ACTIVE', NULL, NULL, NULL, 'Brown');
GO

-- 6. Insert User Connections (Each Owner connected to at least 3 Jockeys)
INSERT INTO [dbo].[user_connections] ([requester_id], [recipient_id], [status], [created_at]) VALUES
-- Benimaru <-> ranga, beretta, diablo
((SELECT id FROM [users] WHERE username='benimaru'), (SELECT id FROM [users] WHERE username='ranga'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='benimaru'), (SELECT id FROM [users] WHERE username='beretta'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='benimaru'), (SELECT id FROM [users] WHERE username='diablo'), 'ACCEPTED', GETDATE()),

-- Souei <-> beretta, diablo, carrion
((SELECT id FROM [users] WHERE username='souei'), (SELECT id FROM [users] WHERE username='beretta'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='souei'), (SELECT id FROM [users] WHERE username='diablo'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='souei'), (SELECT id FROM [users] WHERE username='carrion'), 'ACCEPTED', GETDATE()),

-- Hakuro <-> diablo, carrion, phobio
((SELECT id FROM [users] WHERE username='hakuro'), (SELECT id FROM [users] WHERE username='diablo'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='hakuro'), (SELECT id FROM [users] WHERE username='carrion'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='hakuro'), (SELECT id FROM [users] WHERE username='phobio'), 'ACCEPTED', GETDATE()),

-- Geld <-> carrion, phobio, suphia
((SELECT id FROM [users] WHERE username='geld'), (SELECT id FROM [users] WHERE username='carrion'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='geld'), (SELECT id FROM [users] WHERE username='phobio'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='geld'), (SELECT id FROM [users] WHERE username='suphia'), 'ACCEPTED', GETDATE()),

-- Gabil <-> phobio, suphia, albis
((SELECT id FROM [users] WHERE username='gabil'), (SELECT id FROM [users] WHERE username='phobio'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='gabil'), (SELECT id FROM [users] WHERE username='suphia'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='gabil'), (SELECT id FROM [users] WHERE username='albis'), 'ACCEPTED', GETDATE()),

-- Rigurd <-> suphia, albis, grucius
((SELECT id FROM [users] WHERE username='rigurd'), (SELECT id FROM [users] WHERE username='suphia'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='rigurd'), (SELECT id FROM [users] WHERE username='albis'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='rigurd'), (SELECT id FROM [users] WHERE username='grucius'), 'ACCEPTED', GETDATE()),

-- Gobta <-> albis, grucius, ranga
((SELECT id FROM [users] WHERE username='gobta'), (SELECT id FROM [users] WHERE username='albis'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='gobta'), (SELECT id FROM [users] WHERE username='grucius'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='gobta'), (SELECT id FROM [users] WHERE username='ranga'), 'ACCEPTED', GETDATE()),

-- Kaijin <-> grucius, ranga, beretta
((SELECT id FROM [users] WHERE username='kaijin'), (SELECT id FROM [users] WHERE username='grucius'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='kaijin'), (SELECT id FROM [users] WHERE username='ranga'), 'ACCEPTED', GETDATE()),
((SELECT id FROM [users] WHERE username='kaijin'), (SELECT id FROM [users] WHERE username='beretta'), 'ACCEPTED', GETDATE());
GO

-- 7. Insert Race Tracks (1 Straight, 1 Circular)
INSERT INTO [dbo].[race_tracks] ([name], [location], [surface_condition]) VALUES
(N'Sân đua Thẳng Tempest', N'Thành phố Tempest', 'Good'),
(N'Sân đua Tròn Jura', N'Đại ngàn Jura', 'Good');
GO

-- 8. Insert Tournaments (Admin Created, Fees & Prizes < 20,000 VND, Referees Assigned)
INSERT INTO [dbo].[tournaments] ([tournament_name], [location], [description], [tournament_status], [start_date], [end_date], [registration_deadline], [referee_id], [entry_fee], [total_prize], [prize_first], [prize_second], [prize_third], [min_bet_amount], [min_slots], [max_slots], [allowed_classes], [allowed_ages], [allowed_genders], [registration_opening_time], [official_race_time]) VALUES
(N'Giải Đấu Hoàng Gia Tempest', N'Thành phố Tempest', N'Giải đấu tốc độ chính thức đường đua thẳng ma quốc Tempest', 'OPEN_FOR_REGISTER', '2026-08-01', '2026-08-05', '2026-07-31 23:59:59', (SELECT id FROM [users] WHERE username='guy_crimson'), 10000.00, 19000.00, 10000.00, 6000.00, 3000.00, 5000.00, 4, 12, 'All Classes', '3-8', 'MALE, FEMALE', '2026-07-20 08:00:00', '2026-08-01 14:00:00'),
(N'Cúp Vô Địch Ma Quốc Jura', N'Đại ngàn Jura', N'Giải đấu đường đua vòng tròn đỉnh cao đại ngàn Jura', 'OPEN_FOR_REGISTER', '2026-08-10', '2026-08-15', '2026-08-09 23:59:59', (SELECT id FROM [users] WHERE username='velgrynd'), 15000.00, 19500.00, 10000.00, 5500.00, 4000.00, 5000.00, 4, 12, 'All Classes', '3-8', 'MALE, FEMALE', '2026-07-25 08:00:00', '2026-08-10 15:00:00');
GO

-- 9. Insert Blacklist Entries (3 accounts put on ban list)
INSERT INTO [dbo].[blacklist] ([target_type], [target_id], [reason], [start_date], [end_date], [is_permanent], [status], [created_at]) VALUES
('USER', (SELECT id FROM [users] WHERE username='clayman'), N'Vi phạm điều khoản dịch vụ và hành vi gian lận tại Tempest', GETDATE(), NULL, 1, 'ACTIVE', GETDATE()),
('USER', (SELECT id FROM [users] WHERE username='footman'), N'Quấy rối trật tự trường đua và cố ý gây rối', GETDATE(), NULL, 1, 'ACTIVE', GETDATE()),
('USER', (SELECT id FROM [users] WHERE username='laplace'), N'Thao túng hành vi cá cược trái phép', GETDATE(), NULL, 1, 'ACTIVE', GETDATE());
GO

-- 10. Insert Upgrade Requests (2 PENDING, 2 REJECTED)
INSERT INTO [dbo].[upgrade_requests] ([user_id], [requested_role], [status], [notes], [rejection_reason], [full_name], [phone_number], [identity_number], [date_of_birth], [stable_name], [stable_address], [license_number], [height], [weight], [experience_years], [created_at]) VALUES
-- 1. Kurobe (Owner - PENDING)
((SELECT id FROM [users] WHERE username='kurobe'), 'HORSE_OWNER', 'PENDING', N'Yêu cầu nâng cấp tài khoản lên Chủ Ngựa cho trang trại Kurobe', NULL, 'Kurobe Smith', '0901000037', '038090100037', '1992-04-10', N'Chuồng Ngựa Kurobe', N'Khu Rèn Tempest', NULL, NULL, NULL, 5, GETDATE()),

-- 2. Sooka (Jockey - PENDING)
((SELECT id FROM [users] WHERE username='sooka'), 'JOCKEY', 'PENDING', N'Yêu cầu nâng cấp tài khoản lên Kỵ Thủ chuyên nghiệp', NULL, 'Sooka Dragonewt', '0901000038', '038090100038', '1998-06-15', NULL, NULL, 'JCK-TEMPEST-09', 168.0, 51.0, 3, GETDATE()),

-- 3. Yamato (Owner - REJECTED)
((SELECT id FROM [users] WHERE username='yamato'), 'HORSE_OWNER', 'REJECTED', N'Yêu cầu nâng cấp tài khoản thành Chủ Ngựa', N'Hồ sơ không hợp lệ: Thông tin giấy phép và địa chỉ trang trại chưa đầy đủ.', 'Yamato General', '0901000039', '038090100039', '1989-10-20', N'Chuồng Ngựa Yamato', N'Khu Quân Sự Tempest', NULL, NULL, NULL, 2, GETDATE()),

-- 4. Takuya (Jockey - REJECTED)
((SELECT id FROM [users] WHERE username='takuya'), 'JOCKEY', 'REJECTED', N'Yêu cầu nâng cấp tài khoản thành Kỵ Thủ', N'Không đạt yêu cầu: Cân nặng và chiều cao không phù hợp tiêu chuẩn Kỵ Thủ Tempest.', 'Takuya Ninja', '0901000040', '038090100040', '1999-12-01', NULL, NULL, 'JCK-TEMPEST-10', 172.0, 58.0, 1, GETDATE());
GO

-- 11. Create Wallets for all accounts with starting balance of 50,000.00 VNĐ
INSERT INTO [dbo].[wallets] ([user_id], [balance], [created_at])
SELECT id, 50000.00, GETDATE() FROM [dbo].[users];
GO

USE [master]
GO
ALTER DATABASE [HorseRacingDB] SET  READ_WRITE
GO
